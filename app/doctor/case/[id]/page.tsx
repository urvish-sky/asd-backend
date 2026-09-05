import CaseReviewClient from './CaseReviewClient';

export const dynamic = 'force-dynamic';

export default async function CaseReviewPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams?.id ?? '';
  return <CaseReviewClient id={id} />;
}
