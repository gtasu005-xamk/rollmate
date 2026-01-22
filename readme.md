Deployment Notes: Prisma on Azure App Service (Linux)
Issue

Application crashed on startup after deployment to Azure App Service (Linux).

Error indicated a Prisma query engine mismatch:

Prisma Client generated for Windows

Runtime required Linux (debian-openssl-3.0.x).

Root Cause

Prisma Client is platform-specific.

Client was generated locally on Windows and deployed as-is.

Azure App Service runs on Linux, requiring a different Prisma query engine binary.

Fix

Prisma Client is generated during deployment in the Linux environment.

Azure App Service configuration:

SCM_DO_BUILD_DURING_DEPLOYMENT = true

NPM_CONFIG_PRODUCTION = false

Prisma generation executed via:

postinstall: prisma generate

Updated schema.prisma:

            generator client {
            provider      = "prisma-client-js"
            binaryTargets = ["native", "debian-openssl-3.0.x"]
            }

Outcome

Correct Linux Prisma query engine generated.

Application starts successfully on Azure App Service.