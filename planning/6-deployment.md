# 6. Deployment (GCP VM + GitHub Actions)

How production is set up and deployed. The choices are in
[`1-tech-stack.md`](1-tech-stack.md) (Deployment / CI-CD); this file is the
runbook. Scope for now: **client + backend** only. The admin app is deferred
(add a `Dockerfile.admin`, a compose service, an nginx server block and an
`ADMIN_ENV_PRODUCTION` secret when it ships).

```
browser ──HTTPS──> nginx (:443, Certbot) ──> client  (Next.js :3001)   yourdomain.com
                     │                   └─> backend (NestJS :8000)   api.yourdomain.com
                     │                         ├─ Chromium opens http://client:3001/print (compose network)
                     │                         └─ Supabase, Upstash, Clerk, Gemini (+Live), Resend
GitHub Actions ──WIF──> Artifact Registry ──pull──> VM (docker compose, /opt/craftcv)
```

The live environment was set up by hand in the Console, so some names differ
from the commands below:

| What                  | Live value                                                   |
| --------------------- | ------------------------------------------------------------ |
| Project               | `craftcv-511716` (number `515657505766`)                     |
| Registry              | `cv-craft` (hardcoded in `deploy.yml`)                       |
| VM / zone             | `cv-craft-server` / `asia-southeast1-a`, IP `34.124.219.233` |
| VM service account    | Compute Engine default (`515657505766-compute@...`)          |
| Deployer              | `id-github-deployer@craftcv-511716.iam.gserviceaccount.com`  |
| Domains (DNS: tenten) | `cv-builder.site` (+ `www`), `api.cv-builder.site`           |

## Files

| File                                           | Role                                                                                                       |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `.dockerignore`                                | keeps `node_modules`, build output and every `.env*` out of the build context                              |
| `docker/Dockerfile.backend`                    | `turbo prune` → build → prod deps; runner has apt `chromium` (`PUPPETEER_EXECUTABLE_PATH`)                 |
| `docker/Dockerfile.client`                     | Next standalone; `NEXT_PUBLIC_*` as build args, `CLERK_SECRET_KEY` at runtime                              |
| `docker/docker-compose.prod.yml`               | backend, client, nginx, certbot; `json-file` logs with rotation                                            |
| `docker/nginx/templates/default.conf.template` | 80 → 443 redirect + ACME webroot, `www` → apex, `APP_DOMAIN` → client, `API_DOMAIN` → backend (+Socket.IO) |
| `.github/workflows/ci.yml`                     | PRs (and called by deploy): install, prisma generate, lint, typecheck, test, build                         |
| `.github/workflows/deploy.yml`                 | push to `main`: CI → build + push both images (tag = sha) → scp release → `compose up -d`                  |

## One-time setup

Region `asia-southeast1` (Singapore). Run from a machine with `gcloud` signed in.

### 1. Project, APIs, registry

```bash
PROJECT_ID=craftcv-prod REGION=asia-southeast1 ZONE=asia-southeast1-b
gcloud projects create $PROJECT_ID && gcloud config set project $PROJECT_ID
# link the billing account that holds the credits (Console → Billing), and add a budget alert
gcloud services enable compute.googleapis.com artifactregistry.googleapis.com \
  iamcredentials.googleapis.com sts.googleapis.com oslogin.googleapis.com
gcloud artifacts repositories create cv-craft --repository-format=docker --location=$REGION
```

### 2. VM

e2-medium (2 vCPU, 4 GB) is enough for client + backend with 2 GB swap; move
to e2-standard-2 when admin is added.

```bash
gcloud iam service-accounts create craftcv-vm
VM_SA=craftcv-vm@$PROJECT_ID.iam.gserviceaccount.com
gcloud artifacts repositories add-iam-policy-binding cv-craft --location=$REGION \
  --member=serviceAccount:$VM_SA --role=roles/artifactregistry.reader

gcloud compute addresses create craftcv-ip --region=$REGION
gcloud compute instances create craftcv-vm --zone=$ZONE \
  --machine-type=e2-medium --boot-disk-size=30GB \
  --image-family=ubuntu-2404-lts-amd64 --image-project=ubuntu-os-cloud \
  --address=craftcv-ip --service-account=$VM_SA --scopes=cloud-platform \
  --tags=http-server,https-server --metadata=enable-oslogin=TRUE
gcloud compute firewall-rules create allow-web --allow=tcp:80,tcp:443 \
  --target-tags=http-server,https-server
```

On the VM (`gcloud compute ssh craftcv-vm --zone=$ZONE`):

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo gcloud auth configure-docker asia-southeast1-docker.pkg.dev --quiet
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile \
  && sudo swapon /swapfile && echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
sudo mkdir -p /opt/craftcv/certbot/conf /opt/craftcv/certbot/www
```

### 3. DNS

A records for `yourdomain.com` and `api.yourdomain.com` → the static IP
(`gcloud compute addresses describe craftcv-ip --region=$REGION --format='value(address)'`).

### 4. Workload Identity Federation (GitHub → GCP, no JSON key)

```bash
REPO=DangTinh040203/CVCraft
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
gcloud iam service-accounts create github-deployer
DEPLOYER=github-deployer@$PROJECT_ID.iam.gserviceaccount.com

gcloud iam workload-identity-pools create github --location=global
gcloud iam workload-identity-pools providers create-oidc github-provider \
  --location=global --workload-identity-pool=github \
  --issuer-uri=https://token.actions.githubusercontent.com \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='$REPO'"
gcloud iam service-accounts add-iam-policy-binding $DEPLOYER --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github/attribute.repository/$REPO"

gcloud artifacts repositories add-iam-policy-binding cv-craft --location=$REGION \
  --member=serviceAccount:$DEPLOYER --role=roles/artifactregistry.writer
for r in roles/compute.osAdminLogin roles/compute.viewer; do
  gcloud projects add-iam-policy-binding $PROJECT_ID --member=serviceAccount:$DEPLOYER --role=$r
done
gcloud iam service-accounts add-iam-policy-binding $VM_SA \
  --member=serviceAccount:$DEPLOYER --role=roles/iam.serviceAccountUser
```

### 5. External services (production instances)

- **Supabase:** `DATABASE_URL` = session pooler (`aws-<region>.pooler.supabase.com:5432`,
  user `postgres.<ref>`), see the IPv6 gotcha in `1-tech-stack.md`. Keep the
  direct URL as `DIRECT_URL` on your machine for migrations.
- **Upstash:** a Redis database in `ap-southeast-1`; `REDIS_URL=rediss://...` (TLS).
- **Clerk:** a production instance with its own Google/GitHub OAuth apps and
  a verified domain. Webhook → `https://api.yourdomain.com/api/v1/users/clerk`.
- **Resend:** verify the domain used by `MAIL_FROM_ADDRESS`.

### 6. GitHub secrets and variables

`apps/backend/.env.production` and `apps/client/.env.production` (gitignored)
are the source of truth.

Backend needs: `FRONTEND_ORIGIN=https://yourdomain.com` (CORS + Socket.IO).
`NODE_ENV`, `PORT` and `PDF_RENDER_URL` are set by the compose file.
Client needs: `NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1`, the
Clerk keys, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_REDIRECT_URL`.

```bash
gh secret set BE_ENV_PRODUCTION < apps/backend/.env.production
gh secret set FE_ENV_PRODUCTION < apps/client/.env.production
gh variable set GCP_PROJECT_ID   --body craftcv-prod
gh variable set GCP_REGION       --body asia-southeast1
gh variable set GCP_WIF_PROVIDER --body "projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/github/providers/github-provider"
gh variable set GCP_DEPLOYER_SA  --body github-deployer@craftcv-prod.iam.gserviceaccount.com
gh variable set GCE_INSTANCE     --body craftcv-vm
gh variable set GCE_ZONE         --body asia-southeast1-b
gh variable set APP_DOMAIN       --body yourdomain.com
gh variable set API_DOMAIN       --body api.yourdomain.com
```

A new `NEXT_PUBLIC_*` variable must be added in **three** places: the env
schema (`apps/client/configs/env.config.ts`), the `ARG`/`ENV` list in
`Dockerfile.client`, and the `grep` in `deploy.yml`. Missing one builds fine
and ships `undefined`.

### 7. First certificate (before the first deploy)

nginx won't start without a certificate, so issue it once with Certbot's
standalone server while port 80 is still free:

```bash
sudo docker run --rm -p 80:80 -v /opt/craftcv/certbot/conf:/etc/letsencrypt \
  certbot/certbot:v3.1.0 certonly --standalone --non-interactive --agree-tos \
  -m you@example.com -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

The certificate is stored under the first name (`live/yourdomain.com/`),
which is what the nginx template expects. After that the `certbot` service
renews it through the webroot every 12 h and nginx reloads every 6 h.

### 8. Database migrations (manual, never in the pipeline)

Run from your machine before merging a schema change:

```bash
DIRECT_URL=<supabase direct or session-pooler url> pnpm --filter @repo/backend db:migrate:deploy
```

## Deploying

Push (or merge) to `main`, or run **Deploy** by hand from the Actions tab.
Each deploy tags images with the commit sha, so a rollback is re-running the
Deploy workflow for an older commit (Actions → Deploy → the old run → Re-run).

Useful commands on the VM (`cd /opt/craftcv`):

```bash
sudo docker compose -f docker-compose.prod.yml ps
sudo docker compose -f docker-compose.prod.yml logs -f backend
sudo docker compose -f docker-compose.prod.yml restart client
```

## Gotchas

- Docker runs with `sudo` on the VM: the OS Login user isn't reliably in the `docker` group.
- The backend sits behind nginx, so `main.ts` sets Express `trust proxy` in
  production; without it the throttler sees every user as nginx's IP.
- nginx resolves `client`/`backend` per request (Docker DNS + `proxy_pass`
  with a variable). A plain `proxy_pass http://client:3001` caches the IP at
  start and answers 502 once a redeploy recreates the container.
- `.dockerignore` drops every `.env*`: a local `apps/client/.env` in the build
  context would be read by `next build` and ship `localhost` URLs.
- `NEXT_PUBLIC_WS_URL` is not a build arg: unset, the interview socket uses
  the API origin, while an empty build arg would inline `""`.
- Health checks use `127.0.0.1`, not `localhost` (which can resolve to `::1`).
- `GET /api/v1/health` answers 503 when Upstash is unreachable, so the backend
  container shows `unhealthy` even though requests still work (cache is best-effort).
