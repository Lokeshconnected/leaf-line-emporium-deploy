FROM node:20-alpine

# small utils
RUN apk add --no-cache bash dumb-init git

WORKDIR /workspace

# Copy the whole monorepo so pnpm workspaces can be installed
COPY . /workspace

# Install PNPM and dependencies
RUN npm i -g pnpm@latest
RUN pnpm install --frozen-lockfile

# Build the api-server package
RUN pnpm --filter @workspace/api-server run build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["dumb-init", "node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
