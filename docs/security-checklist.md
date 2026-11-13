# SECURITY CHECKLIST – SMART CRM MEKONG MOBILE

**Module:** L4 – Technician Assignment and Appointment Scheduling  
**Environment:** Local Docker Compose deployment  
**Date:** 13/11/2026

## Security checklist

| No. | Security control | Status | Evidence / Notes |
|---|---|---|---|
| SEC-01 | Ignore local environment files | ĐÃ LÀM | `.gitignore` includes `.env` and `.env.*`. Git history verification is tracked separately. |
| SEC-02 | Use environment variables for database credentials | ĐÃ LÀM | `compose.yaml` references `DOCKER_DB_PASSWORD` and `DATABASE_URL`; `.env.example` provides sample variables. |
| SEC-03 | Restrict application port to localhost | ĐÃ LÀM | `compose.yaml` maps `127.0.0.1:3015:3000`. |
| SEC-04 | Avoid exposing PostgreSQL host port | ĐÃ LÀM | PostgreSQL service has no host port mapping in the reviewed Compose configuration. |
| SEC-05 | Implement authentication | CHƯA LÀM | Authentication has not been fully implemented. See `docs/deployment-guide.md`, section 5.5. |
| SEC-06 | Implement role-based authorization | CHƯA LÀM | Role-based access control has not been fully implemented. See `README.md`, section 9.7. |
| SEC-07 | Check environment files and common secret patterns | ĐÃ LÀM | `git log --all --oneline -- .env` returned no commits; historical environment filenames showed only `.env.example`; `git grep` found sample passwords and environment-variable references, not actual credentials. This is a limited check, not a full historical secret scan. |

## Security limitations

- The application is intended for local development, demonstration, and academic testing.
- The seed database contains demonstration data.
- Authentication and role-based authorization are incomplete.
- Do not expose this application publicly as a production service without additional security controls.
- A successful configuration check does not constitute a full security audit.
