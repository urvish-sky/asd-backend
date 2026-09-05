import CaseReviewClient from './CaseReviewClient';

export const dynamic = 'force-dynamic';

export default async function CaseReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams?.id ?? '';
  return <CaseReviewClient id={id} />;
}
