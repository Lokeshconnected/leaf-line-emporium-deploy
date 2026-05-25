FROM node:20-alpine AS build
WORKDIR /workspace

RUN apk add --no-cache git

# Copy repo
COPY . /workspace

# Install pnpm and deps, build frontend
RUN npm i -g pnpm@latest
RUN pnpm install --frozen-lockfile
RUN pnpm --filter leafline run build

FROM nginx:stable-alpine
COPY --from=build /workspace/artifacts/leafline/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
