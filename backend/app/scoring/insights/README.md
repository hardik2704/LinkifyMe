# HR Insights Template

This folder contains interview notes from HR professionals.
Drop markdown files following this template to add scoring insights.

## File naming convention
`YYYY-MM-DD__description.md`

Example: `2026-01-20__amazon_sde_hiring_manager.md`

## Template

```markdown
# Interview with [Title] at [Company]

## Persona
big_company_recruiter

## What they cared about
- quantified impact in experience bullets
- strong skill keywords matching role
- credible education signals

## Add-on scoring ideas
- If experience bullets contain metrics (%, $, x), add +0.3 to Experience
- If top skills contain 'system design', add +0.2 to Skills

## Red flags
- too generic about section => -0.3 About
- no profile picture => -0.5 profile_pic
```

## Compiling insights

Run the compiler to generate rules:
```bash
python -m app.scoring.insights.compiler
```

This generates `rules/hr_insights_compiled.yaml` which is loaded by the scoring engine.
