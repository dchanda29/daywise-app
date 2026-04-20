FROM node:22-alpine

WORKDIR /app

# Use Corepack so pnpm version comes from packageManager.
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["pnpm", "start"]
