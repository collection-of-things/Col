import { Video } from '@torch-ui/solid/data-display'



import { render } from "solid-js/web";
function Example() {

;
return (<>
<Video src="https://archive.org/download/springopenmovie/springopenmovie.mp4" poster="https://video.blender.org/lazy-static/previews/3d95fb3d-c866-42c8-9db1-fe82f48ccb95.jpg" />
</>);
}
export default function mount(target) { return render(() => <Example />, target); }
