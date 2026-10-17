-- Profiles row only after email confirmation (not on signup insert)
-- Run in Supabase SQL Editor.

drop trigger if exists on_auth_user_created on auth.users;

create or replace function public.handle_user_confirmed()
returns trigger as $$
begin
  if new.email_confirmed_at is not null
     and old.email_confirmed_at is null then
    insert into public.profiles (
      id, email, full_name, university, major, graduation_year
    ) values (
      new.id,
      new.email,
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'university',
      new.raw_user_meta_data->>'major',
      (new.raw_user_meta_data->>'graduation_year')::integer
    )
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_confirmed
  after update on auth.users
  for each row execute procedure public.handle_user_confirmed();
