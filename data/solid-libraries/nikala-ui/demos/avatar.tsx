import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
const importCode = `import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";`;
const defaultCode = `<Avatar>
  <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Niko Pirosmani" />
  <AvatarFallback>NP</AvatarFallback>
</Avatar>`;
const fallbackCode = `<Avatar>
  <AvatarImage src="/invalid.jpg" alt="Broken User" />
  <AvatarFallback>NP</AvatarFallback>
</Avatar>`;
const sizesCode = `<div class="flex items-center gap-4">
  <Avatar class="h-8 w-8">
    <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Small Avatar" />
    <AvatarFallback>SM</AvatarFallback>
  </Avatar>

  <Avatar class="h-10 w-10">
    <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Medium Avatar" />
    <AvatarFallback>MD</AvatarFallback>
  </Avatar>

  <Avatar class="h-14 w-14">
    <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Large Avatar" />
    <AvatarFallback>LG</AvatarFallback>
  </Avatar>
</div>`;
export default function Demo() {

return <>
          <Avatar>
            <AvatarImage
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Niko Pirosmani"
            />
            <AvatarFallback>NP</AvatarFallback>
          </Avatar>
        </>;
}
