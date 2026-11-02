import { render } from "solid-js/web";
import {
  AccordionRoot,
  AccordionItemStyled,
  AccordionTriggerStyled,
  AccordionContentStyled,
} from '@torch-ui/solid/layout'


function Example() { return (<div class="w-full max-w-2xl"><AccordionRoot class="w-full">
  <AccordionItemStyled value="item-1">
    <AccordionTriggerStyled>Section 1</AccordionTriggerStyled>
    <AccordionContentStyled>Content for section 1.</AccordionContentStyled>
  </AccordionItemStyled>
  <AccordionItemStyled value="item-2">
    <AccordionTriggerStyled>Section 2</AccordionTriggerStyled>
    <AccordionContentStyled>Content for section 2.</AccordionContentStyled>
  </AccordionItemStyled>
  <AccordionItemStyled value="item-3">
    <AccordionTriggerStyled>Section 3</AccordionTriggerStyled>
    <AccordionContentStyled>Content for section 3.</AccordionContentStyled>
  </AccordionItemStyled>
</AccordionRoot></div>); }

export default function mount(target: HTMLElement) { return render(() => <Example />, target); }
