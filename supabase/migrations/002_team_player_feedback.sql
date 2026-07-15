-- Add team + player coaching scopes to analyses
alter table analyses
  add column if not exists teams jsonb not null default '[]'::jsonb;

alter table analyses
  add column if not exists players jsonb not null default '[]'::jsonb;
