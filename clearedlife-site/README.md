# ClearedLife MVP site

Static, dependency-free launch site for ClearedLife.

## Included

- Responsive landing page
- Interactive clearance-readiness assessment (preparation score only)
- Life-event / reporting guidance demo
- ClearedLife Ready, Vault, Guard, Jobs product architecture
- Employer / FSO dashboard concept
- Continuous Vetting / five-year PVQ positioning
- MVP pricing concept
- Privacy and terms/disclaimer starter pages
- DCSA primary-source links
- Vercel configuration, robots.txt, sitemap.xml

## Run locally

From this folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy

This is a static site and can be deployed directly to Vercel, Netlify, Cloudflare Pages, GitHub Pages, or any normal web host.

For Vercel, import the folder/repository as a project with no framework preset required.

## Before public launch

1. Confirm ownership of `clearedlife.com` and configure DNS.
2. Replace `hello@clearedlife.com` if a different inbox will be used.
3. Finalize pricing.
4. Have privacy/terms reviewed before collecting sensitive information.
5. Do **not** turn the Vault into a live SF-86 repository until a production security architecture, retention policy, access-control model, breach/incident plan, and legal review are complete.
6. Add a real early-access backend or CRM form.
7. Add analytics only after deciding what privacy posture ClearedLife will take.

## Product principle

ClearedLife supports preparation, organization, education, and workflow. It does not grant, sponsor, adjudicate, guarantee, or predict a government security clearance.
