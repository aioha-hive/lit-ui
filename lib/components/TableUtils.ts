import { html } from 'lit'
import { CloseIcon } from './Icons.js'

const sizes: { [s: number]: string } = {
  7: 'w-7',
  12: 'w-12'
}

export const RightAngledArrow = (w = 7) => {
  return html`
    <td class="px-1 py-4 ${sizes[w]} whitespace-nowrap">
      <svg
        class="w-4 h-4 mx-auto text-gray-400 dark:text-gray-500 opacity-70"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </td>
  `
}

export const RmRowIcon = (w = 7) => {
  return html` <td class="px-1 py-4 ${sizes[w]} whitespace-nowrap text-gray-800 dark:text-gray-100">${CloseIcon('Remove account')}</td> `
}
