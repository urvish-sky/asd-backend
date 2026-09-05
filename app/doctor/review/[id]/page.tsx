import CaseReviewClient from '../../case/[id]/CaseReviewClient';

export default async function DoctorReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CaseReviewClient id={id} />;
}
