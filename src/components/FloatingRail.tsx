import AccessibilityMenu, { type A11yMenuDict } from './AccessibilityMenu'
import StickyWhatsApp from './StickyWhatsApp'

/**
 * The fixed rail in the bottom corner: the accessibility menu, and the WhatsApp
 * button beneath it.
 *
 * One container rather than two independently positioned elements. The WhatsApp
 * button is `md:hidden` - it exists only on phones - while the accessibility
 * menu has to be on every page at every width, so coordinating two sets of
 * `bottom` and `end` offsets would mean keeping them in agreement by hand
 * forever. Here they stack, and the menu simply sits alone on desktop.
 *
 * `end-5` rather than `right-5`: it flips to the left in Hebrew on its own.
 *
 * `flex-col-reverse` puts WhatsApp at the bottom visually while placing the
 * accessibility trigger first in the DOM, and therefore first in the tab order
 * of the pair. That ordering is deliberate - the menu contains the pause
 * control for the project-card animation, and a control for stopping motion
 * that comes after the motion is not much of a control.
 *
 * `relative` on the container is what the panel anchors to, so it opens upward
 * from the trigger on whichever side the rail is on.
 */
export default function FloatingRail({
  a11yDict,
  statementHref,
  whatsappMessage,
  whatsappLabel,
}: {
  a11yDict: A11yMenuDict
  statementHref: string
  whatsappMessage: string
  whatsappLabel: string
}) {
  return (
    <div className="fixed bottom-5 end-5 z-40 flex flex-col-reverse items-center gap-3">
      <div className="relative">
        <AccessibilityMenu dict={a11yDict} statementHref={statementHref} />
      </div>
      <StickyWhatsApp message={whatsappMessage} label={whatsappLabel} />
    </div>
  )
}
