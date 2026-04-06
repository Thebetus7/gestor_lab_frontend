// Este archivo está deprecado — la página oficial está en src/app/(dashboard)/actividades/
// Next.js redirige automáticamente a través del route group (dashboard)
import { redirect } from 'next/navigation';
export default function OldActividadesRedirect() {
  redirect('/actividades');
}
