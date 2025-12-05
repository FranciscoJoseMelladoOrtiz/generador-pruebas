import TestForm from "@/components/TestForm";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TestForm projectId={id} />;
}
