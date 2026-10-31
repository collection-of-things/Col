import Accordion from "rocksolidjs/Accordion";
import AccordionSummary from "rocksolidjs/AccordionSummary";
import AccordionDetails from "rocksolidjs/AccordionDetails";

export default function Example() {
  return (
    <div class="max-w-md">
      <Accordion>
        <AccordionSummary>
          What is gravity?
        </AccordionSummary>
        <AccordionDetails>
          Gravity is a force that attracts objects with mass
          toward one another. On Earth, it gives objects weight
          and causes them to fall toward the ground.
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary>
          What is photosynthesis?
        </AccordionSummary>
        <AccordionDetails>
          Photosynthesis is the process by which plants use
          sunlight, water, and carbon dioxide to produce
          energy in the form of glucose.
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary>
          What is an atom?
        </AccordionSummary>
        <AccordionDetails>
          An atom is the smallest unit of an element that
          retains the chemical properties of that element.
          It consists of a nucleus surrounded by electrons.
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
