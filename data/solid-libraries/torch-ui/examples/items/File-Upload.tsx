import { createSignal } from 'solid-js'

import { FileUpload, type FileUploadItem } from '@torch-ui/solid/forms'



import { render } from "solid-js/web";
function Example() {

const [files, setFiles] = createSignal<FileUploadItem[]>([])

const onAddFiles = (newFiles: File[]) => {
  const items: FileUploadItem[] = newFiles.map((file) => ({
    id: crypto.randomUUID(),
    file,
    status: 'done',
  }))
  setFiles((prev) => [...prev, ...items])
};
return (<>
<FileUpload
  label="Upload Files"
  description="Max 10 MB. Omit accept to allow any file type."
  files={files()}
  onAddFiles={onAddFiles}
  onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
  maxFileSize={10 * 1024 * 1024}
  variant="dropzone"
/>
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
