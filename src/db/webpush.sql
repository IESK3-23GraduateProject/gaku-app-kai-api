-- Create push_subscriptions table with reference to student_users
create table public.push_subscriptions (
    subscription_id uuid default uuid_generate_v4() primary key,
    student_user_id int not null references public.student_users(student_user_id),
    endpoint text not null,
    keys jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    is_active boolean default true,
    unique(student_user_id, endpoint)
);

-- Create trigger to automatically update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    NEW.updated_at = now();
    return NEW;
end;
$$ language plpgsql;

create trigger update_push_subscriptions_updated_at
    before update on public.push_subscriptions
    for each row
    execute function update_updated_at_column();

-- Create index for faster lookups
create index idx_push_subscriptions_student_user_id on public.push_subscriptions(student_user_id);
create index idx_push_subscriptions_endpoint on public.push_subscriptions(endpoint);
