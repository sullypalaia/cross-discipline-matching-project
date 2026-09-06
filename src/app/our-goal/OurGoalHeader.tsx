"use client";

import SiteHeader from "@/components/SiteHeader";

type OurGoalHeaderProps = { accountLabel: string | null };

export default function OurGoalHeader({ accountLabel }: OurGoalHeaderProps) {
  return <SiteHeader accountLabel={accountLabel} />;
}
