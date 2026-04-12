# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH

COPY package.json package-lock.json* ./

RUN npm install --legacy-peer-deps

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build


# Stage 2: Runner
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8400

# Next.js standalone output จะรวมไฟล์ที่จำเป็นไว้ให้แล้ว
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 8400

# รันด้วย server.js (สำหรับ standalone mode)
CMD ["node", "server.js"]