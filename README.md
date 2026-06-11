# 供应商门户前端

精简版供应商在线竞价门户，独立于管理端前端。

## 技术栈

Vue 3 + Vite + TypeScript + Element Plus + Pinia

## 开发

```bash
pnpm install
pnpm dev
```

默认端口 `80`，API 网关地址见 `.env.local`。

## 页面

| 路由 | 说明 | 登录 |
|------|------|------|
| `/` | 门户首页 | 否 |
| `/announcements` | 通知公告 | 否 |
| `/login` | 账号密码登录 | 否 |
| `/target-hall` | 标的大厅（报名） | 是 |
| `/trade-hall` | 交易大厅 | 是 |
| `/room-detail?id=` | 竞价室详情 | 是 |
| `/bid-room?id=` | 在线竞价室 | 是 |

## 环境变量

| 变量 | 说明 |
|------|------|
| `VITE_BASE_URL` | 网关地址 |
| `VITE_API_URL` | API 前缀，默认 `/supplier-api` |
| `VITE_BASE_PATH` | 部署子路径，默认 `/` |

WebSocket 连接：`{VITE_BASE_URL}/infra/ws`（与网关 `infra-websocket` 路由一致）
