# Hugging Face DNS failure (ENOTFOUND)

The Azure Function `api/analyze/index.js` calls `https://api-inference.huggingface.co/...`.
If the runtime cannot resolve `api-inference.huggingface.co`, you’ll see:

- `getaddrinfo ENOTFOUND api-inference.huggingface.co`

## Most common causes

1. **No outbound DNS / networking from the runtime**
2. **Corporate/VPN/Firewall blocks** `api-inference.huggingface.co`
3. **Wrong DNS server configured** in the environment
4. **Temporary DNS issue**

## What this repo can do

- Add a runtime diagnostic route (`GET /api/analyze`) already exists.
- If DNS/network is blocked, code changes alone won’t fix it.

## Required fixes outside code

- Ensure the host environment can resolve and reach:
  - `api-inference.huggingface.co` (DNS)
  - `https://api-inference.huggingface.co` (HTTPS egress)

## Optional fallback

If you want the app to keep working without Hugging Face connectivity, implement a local/offline emotion model or return a graceful UI fallback when proxy fails.

