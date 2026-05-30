import CreateDraftLessonForm from "./CreateDraftLessonForm";

type CreateFirstLessonFormProps = {
  orgSlug: string;
  programSlug: string;
};

/** @deprecated Use CreateDraftLessonForm */
export default function CreateFirstLessonForm(props: CreateFirstLessonFormProps) {
  return <CreateDraftLessonForm {...props} variant="first" />;
}
