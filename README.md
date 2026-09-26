# @corbits/credential-mcp

> [!IMPORTANT]
> This package moved to [`@corbits/credential-http`](https://github.com/corbitsdev/credential-http), which also covers `x-api-key`, raw `authorization` and custom headers. New code should use it. The plugin key, the Bearer shape and the sentinel value are unchanged, so stored credential rows need no migration. The built-in Canva origin allowance is gone: pass it as `extraOrigins`.
>
> | `@corbits/credential-mcp`                                       | `@corbits/credential-http`                                                                                                                                  |
> | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `createMcpStreamableHttpCredentialProvider(opts?)`              | unchanged, plus `extraOrigins?`                                                                                                                             |
> | `McpStreamableHttpCredentialProviderOptions`                    | `CredentialPresetOptions`                                                                                                                                   |
> | `MCP_STREAMABLE_HTTP_PROVIDER_KEY`, `MCP_NO_TOKEN_SENTINEL`     | unchanged                                                                                                                                                   |
> | `mcpOriginPinnedFetch({ pinnedOrigin, readToken, fetch? })`     | `createOriginPinnedFetch({ origin, header: "authorization", readValue, extraOrigins?, fetch? })`, where `readValue` returns `Bearer <token>` or `undefined` |
> | `McpOriginPinnedFetchArgs`                                      | `OriginPinnedFetchOptions`                                                                                                                                  |
> | `resolveMcpTargetUrl`, `assertMcpPinnedTarget`                  | removed; `createOriginPinnedFetch` does both                                                                                                                |
> | `FetchLike`                                                     | import from `@intx/harness`                                                                                                                                 |
> | Built-in `https://mcp.canva.com` → `https://canva.ai` allowance | `extraOrigins: { "https://mcp.canva.com": ["https://canva.ai"] }` on the provider, or `extraOrigins: ["https://canva.ai"]` on `createOriginPinnedFetch`     |

An MCP streamable-HTTP `CredentialProvider` for Interchange: a
tenant-connected MCP server authenticates with `authorization: Bearer
<token>` when the person supplied a token, and with no `authorization`
header at all when they connected keyless. `@intx/harness`'s vendored
`http` provider can't express the keyless case — it always injects the
stored secret — so a keyless connection stores `MCP_NO_TOKEN_SENTINEL` and
this provider omits the header when it reads that sentinel back.

This package is a library only for now: registering a provider into the
Interchange sidecar's `CredentialProviderRegistry` is blocked on an
upstream hook, so a host wires it in by hand until that lands.

## Install

```sh
bun add @corbits/credential-mcp
```

## Usage

```ts
import {
  builtinCredentialProviders,
  createCredentialProviderRegistry,
} from "@intx/harness";
import { createMcpStreamableHttpCredentialProvider } from "@corbits/credential-mcp";

const providers = createCredentialProviderRegistry([
  ...builtinCredentialProviders(),
  createMcpStreamableHttpCredentialProvider(),
]);
```

A keyless MCP-server connection stores `MCP_NO_TOKEN_SENTINEL` as its
credential's secret; this provider recognizes that value and sends no
`authorization` header at all.

## API

- `createMcpStreamableHttpCredentialProvider(opts?)` — the `mcp-streamable-http`
  provider (key `MCP_STREAMABLE_HTTP_PROVIDER_KEY`).
- `MCP_NO_TOKEN_SENTINEL` — stored-secret sentinel for a keyless connection.
- `mcpOriginPinnedFetch`, `assertMcpPinnedTarget`, `resolveMcpTargetUrl` —
  the shared origin-pinning building blocks (also used by an MCP connect-time
  probe), including an explicit extra-origin allowlist for MCP servers whose
  protocol origin differs from their stored base URL (e.g. Canva's
  `https://mcp.canva.com` → `https://canva.ai`).

Every request is pinned to the credential's origin (plus any allowlisted
extra origin) and forces `redirect: "manual"` so a 3xx never sends a token
to a foreign host.

## License

LGPL-2.1-only.
