# Deployment history and legacy-service status

The canonical ztd.me cutover and the later five-domain cutover are complete.
Current releases use [CI & Deploy](../.github/workflows/deploy.yml) and the
[README deployment and rollback process](../README.md#github-actions).

Recorded cutover evidence:

- [Canonical run 36811684865](https://github.com/zeithrold/website/actions/runs/36811684865)
  passed on main `7694f052134cc41879334965f6925b6c2c30f629`, deploying Worker
  version `daa61e8e-af46-472e-b4a2-d9ca309af42c` for ztd.me.
- [Five-domain run 36816247881](https://github.com/zeithrold/website/actions/runs/36816247881)
  passed on main `355d0e1097d5684e4df0c3f7c8dcd4d0ebb50274`, deploying version
  `9db951de-e23e-4b9a-a6f2-0b9cb8a974b6`. The coordinator recorded public
  GET/308/path/query acceptance and unchanged protected DNS and blog/showcase bindings.

The completed cutover procedures, manual-publish steps and legacy rollback
instructions remain in Git history. They are superseded and are not current
release instructions. The one-time retirement workflow was already removed;
the later approved cleanup removes its unused scripts and dedicated tests.
Neither cleanup performs or verifies a remote deletion.

## Last recorded legacy-service status

The owner approved permanent retirement of only Cloudflare Worker `doaink-home`
and Vercel project `zeithrold-dev`; those services are no longer rollback targets.
This repository cleanup does not establish whether either service is absent now.

The archived Vercel record states that deletion was blocked by the available
remote capabilities and the project remained undeleted. That is the last recorded
status, not a fresh verification. The Cloudflare deletion outcome is also
unverified by this cleanup. Any later retirement work needs its own current-state
evidence; this document supplies no executable deletion procedure.

The current `ztd-homepage` Worker, its five domains, blog/showcase, mail DNS and
unrelated infrastructure are unchanged by removal of the transition tooling.
