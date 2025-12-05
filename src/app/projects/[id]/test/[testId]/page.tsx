import TestForm from "@/components/TestForm";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; testId: string }>;
}) {
  const { id, testId } = await params;
  return <TestForm projectId={id} testId={testId} />;
}
