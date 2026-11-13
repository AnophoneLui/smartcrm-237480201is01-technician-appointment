# Deployment Guide – Smart CRM L4

**Project:** Smart CRM – Technician Assignment and Appointment Management
**Student:** Luibouathong Anophone
**Student ID:** 237480201IS01
**Deployment method:** Docker Compose
**Verification date:** November 13, 2026

## 1. Prerequisites

The Smart CRM L4 application uses Node.js, Express, PostgreSQL, and Vue 3.

The following tools are required to deploy the application:

- Git
- Docker Desktop
- Docker Compose
- An available local port: 3015

Node.js and PostgreSQL do not need to be installed separately when running the application through Docker Compose.

For running unit tests directly on the host machine, Node.js 20 or later and npm are required.

## 2. Configuration

### 2.1. Clone the repository

```bash
git clone https://github.com/AnophoneLui/smartcrm-237480201is01-technician-appointment.git
cd smartcrm-237480201is01-technician-appointment
```

### 2.2. Configure environment variables

Create the local environment configuration:

```bash
cp .env.example .env
```

Open the `.env` file and replace the sample value of `DOCKER_DB_PASSWORD` with a secure password.

The `.env` file must not be committed to GitHub.

### 2.3. Docker services

The Docker Compose configuration includes four services:

| Service | Description |
|---|---|
| `db` | PostgreSQL 16 database |
| `migrate` | Runs database migrations |
| `seed` | Initializes demonstration data |
| `api` | Runs the backend API and serves the frontend |

The application uses a separate Docker database named `smartcrm_docker`.

The database data is stored in a named Docker volume. The PostgreSQL port is not published to the host.

## 3. Deployment Steps

### 3.1. Build and start the application

Run:

```bash
docker compose up -d --build
```

Docker Compose performs the following operations:

1. Starts the PostgreSQL database.
2. Waits for the database health check to succeed.
3. Executes the database migrations.
4. Executes the seed scripts.
5. Starts the application after initialization is complete.

### 3.2. Access the application

Open the following address in a web browser:

http://localhost:3015

The frontend and backend are served through the same application port.

### 3.3. Check container status

Run:

```bash
docker compose ps -a
```

Expected results:

| Service | Expected status |
|---|---|
| `db` | Up (healthy) |
| `migrate` | Exited (0) |
| `seed` | Exited (0) |
| `api` | Up (healthy) |

### 3.4. View application logs

Run:

```bash
docker compose logs api
```

To stop the application:

```bash
docker compose down
```

Do not use `docker compose down -v` when the existing database volume must be preserved.

## 4. Verification and Testing

### 4.1. API health check

Run:

```bash
curl -i http://localhost:3015/health
```

Expected HTTP status: `200 OK`.

### 4.2. Ticket API verification

Run:

```bash
curl http://localhost:3015/api/tickets
```

During verification, the seeded database returned eight demonstration tickets.

### 4.3. Unit testing

On a machine with Node.js and npm installed, run:

```bash
npm install
npm test
```

Verified results on November 13, 2026:

| Metric | Result |
|---|---|
| Total tests | 35 |
| Passed | 35 |
| Failed | 0 |
| Skipped | 0 |

The tests cover ticket validation, API data contracts, technician assignment, technician reassignment, status updates, appointment management, scheduling conflicts, and error handling.

These unit tests were executed on the host machine, not inside the Docker API container.

### 4.4. Clean-clone deployment verification

The repository was cloned into a separate test directory to verify deployment from source.

For this isolated test, the host application port was changed locally from `3015` to `3016` to avoid conflicts with the original project.

The clean-clone deployment successfully:

- Started all four Docker Compose services.
- Completed database migrations and seed initialization.
- Returned HTTP 200 from the health endpoint.
- Returned eight demonstration tickets through the Ticket API.
- Loaded the frontend in a browser.
- Assigned a technician to ticket `MM-DEMO-002`.
- Stored the assignment in PostgreSQL.
- Created an entry in `ticket_assignment_log`.

The database record confirmed that ticket `MM-DEMO-002` had status `ASSIGNED`, with `to_technician_id = 1`.

### 4.5. Seed repeatability

The seed process was executed more than once against the test database.

The verified table counts remained unchanged after repeated execution, demonstrating that the tested seed scripts did not create duplicate records.

## 5. Troubleshooting and Limitations

### 5.1. Port conflict

If port `3015` is already in use, stop the conflicting application or change the host-side port mapping in `compose.yaml`.

The clean-clone verification used port `3016`.

### 5.2. Database connection problems

Check the database service:

```bash
docker compose ps -a
docker compose logs db
```

Confirm that the database container is healthy before investigating migration or application errors.

### 5.3. Migration or seed errors

Check initialization logs:

```bash
docker compose logs migrate
docker compose logs seed
```

Review the environment configuration and SQL scripts before restarting the deployment.

### 5.4. Application errors

Check API logs:

```bash
docker compose logs api
```

Verify the health endpoint and database container status.

### 5.5. Security and functional limitations

- The application uses demonstration data for testing.
- Authentication and role-based authorization have not been fully implemented.
- Not all frontend workflows have been verified as complete.
- The appointment scheduling rule assumes a 60-minute time slot.
- The current deployment is intended for local development, demonstration, and academic testing.
- Additional security controls and operational configuration are required before public production deployment.

## Conclusion

The Smart CRM L4 application was successfully deployed and verified using Docker Compose.

Database initialization, application health checks, clean-clone deployment, technician assignment persistence, and all 35 automated unit tests produced successful results in their respective test environments.

The deployment process is reproducible for local development and academic demonstration, subject to the configuration and limitations described above.