import { useParams } from 'react-router-dom';
import { EditorPage } from './EditorPage';

export function AdminTemplateEditorPage() {
  const { id } = useParams();

  console.log(`Admin template editor route opened: /admin/templates/${id ?? ':id'}/editor`);

  return <EditorPage />;
}
