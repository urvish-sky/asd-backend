import CaseReviewClient from './CaseReviewClient';

export const dynamic = 'force-dynamic';

export default async function CaseReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CaseReviewClient id={id} />;
}
