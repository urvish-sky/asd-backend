import CaseReviewClient from './CaseReviewClient';

export function generateStaticParams() {
  return [
    { id: 'ASD-PT001' },
    { id: 'ASD-PT002' },
    { id: 'ASD-PT003' },
  ];
}

export default async function CaseReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CaseReviewClient id={id} />;
}
