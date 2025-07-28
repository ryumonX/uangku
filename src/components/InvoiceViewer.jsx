import 'react-photo-view/dist/react-photo-view.css'
import { PhotoProvider, PhotoView } from 'react-photo-view'

export default function InvoiceViewer({ url }) {
  return (
    <PhotoProvider>
      <PhotoView src={url}>
        <img src={url} className="w-16 h-16 object-cover rounded cursor-pointer" />
      </PhotoView>
    </PhotoProvider>
  )
}
