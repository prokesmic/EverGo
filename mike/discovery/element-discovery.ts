/**
 * Element Discovery Module
 * Discovers all interactive elements on a page
 */

import { Page } from 'playwright'
import { DiscoveredElement, MikeConfig, FormAnalysis, FormField } from '../core/types'
import { v4 as uuidv4 } from 'uuid'

export class ElementDiscovery {
  private config: MikeConfig

  constructor(config: MikeConfig) {
    this.config = config
  }

  /**
   * Discover all interactive elements on the current page
   */
  async discoverElements(page: Page, pageUrl: string): Promise<DiscoveredElement[]> {
    const elements: DiscoveredElement[] = []

    // Discover buttons
    const buttons = await this.discoverButtons(page, pageUrl)
    elements.push(...buttons)

    // Discover links
    const links = await this.discoverLinks(page, pageUrl)
    elements.push(...links)

    // Discover forms and their fields
    const forms = await this.discoverForms(page, pageUrl)
    elements.push(...forms)

    // Discover standalone inputs
    const inputs = await this.discoverInputs(page, pageUrl)
    elements.push(...inputs)

    // Discover selects
    const selects = await this.discoverSelects(page, pageUrl)
    elements.push(...selects)

    // Discover textareas
    const textareas = await this.discoverTextareas(page, pageUrl)
    elements.push(...textareas)

    // Discover checkboxes and radios
    const checkboxes = await this.discoverCheckboxesAndRadios(page, pageUrl)
    elements.push(...checkboxes)

    return elements
  }

  /**
   * Discover all buttons on the page
   */
  private async discoverButtons(page: Page, pageUrl: string): Promise<DiscoveredElement[]> {
    return page.evaluate((url) => {
      const elements: any[] = []
      const buttons = document.querySelectorAll('button, [role="button"], input[type="submit"], input[type="button"]')

      buttons.forEach((btn, index) => {
        const rect = btn.getBoundingClientRect()
        const style = window.getComputedStyle(btn)

        elements.push({
          id: `btn-${index}-${Date.now()}`,
          type: 'button',
          selector: generateSelector(btn),
          text: (btn as HTMLElement).innerText?.trim() || (btn as HTMLInputElement).value || '',
          name: (btn as HTMLButtonElement).name || '',
          ariaLabel: btn.getAttribute('aria-label') || '',
          dataTestId: btn.getAttribute('data-testid') || btn.getAttribute('data-test-id') || '',
          pageUrl: url,
          xpath: getXPath(btn),
          attributes: getAttributes(btn),
          isVisible: style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0,
          isEnabled: !(btn as HTMLButtonElement).disabled,
          boundingBox: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          }
        })
      })

      return elements

      function generateSelector(el: Element): string {
        if (el.id) return `#${CSS.escape(el.id)}`
        if (el.getAttribute('data-testid')) return `[data-testid="${el.getAttribute('data-testid')}"]`
        if (el.getAttribute('name')) return `[name="${el.getAttribute('name')}"]`

        // For buttons, try to use text content
        const text = (el as HTMLElement).innerText?.trim()
        if (text && text.length < 50) {
          return `${el.tagName.toLowerCase()}:has-text("${text.slice(0, 30)}")`
        }

        // Fallback to tag + nth-of-type
        let selector = el.tagName.toLowerCase()
        const parent = el.parentElement
        if (parent) {
          const siblings = parent.querySelectorAll(`:scope > ${selector}`)
          if (siblings.length > 1) {
            const index = Array.from(siblings).indexOf(el)
            selector += `:nth-child(${index + 1})`
          }
        }

        return selector
      }

      function getXPath(el: Element): string {
        if (el.id) return `//*[@id="${el.id}"]`
        const parts: string[] = []
        let current: Element | null = el
        while (current && current.nodeType === Node.ELEMENT_NODE) {
          let index = 1
          let sibling: Element | null = current.previousElementSibling
          while (sibling) {
            if (sibling.tagName === current.tagName) index++
            sibling = sibling.previousElementSibling
          }
          parts.unshift(`${current.tagName.toLowerCase()}[${index}]`)
          current = current.parentElement
        }
        return '/' + parts.join('/')
      }

      function getAttributes(el: Element): Record<string, string> {
        const attrs: Record<string, string> = {}
        for (const attr of el.attributes) {
          attrs[attr.name] = attr.value
        }
        return attrs
      }
    }, pageUrl)
  }

  /**
   * Discover all links on the page
   */
  private async discoverLinks(page: Page, pageUrl: string): Promise<DiscoveredElement[]> {
    return page.evaluate((url) => {
      const elements: any[] = []
      const links = document.querySelectorAll('a[href]')

      links.forEach((link, index) => {
        const a = link as HTMLAnchorElement
        const rect = a.getBoundingClientRect()
        const style = window.getComputedStyle(a)

        // Skip external links and anchors
        const href = a.href
        if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return
        if (href.includes('#') && !href.split('#')[0]) return

        elements.push({
          id: `link-${index}-${Date.now()}`,
          type: 'link',
          selector: generateSelector(a),
          text: a.innerText?.trim() || '',
          href: a.getAttribute('href') || '',
          ariaLabel: a.getAttribute('aria-label') || '',
          dataTestId: a.getAttribute('data-testid') || '',
          pageUrl: url,
          xpath: getXPath(a),
          attributes: getAttributes(a),
          isVisible: style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0,
          isEnabled: true,
          boundingBox: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          }
        })
      })

      return elements

      function generateSelector(el: Element): string {
        if (el.id) return `#${el.id}`
        if (el.getAttribute('data-testid')) return `[data-testid="${el.getAttribute('data-testid')}"]`
        const href = el.getAttribute('href')
        if (href && !href.includes('?')) return `a[href="${href}"]`
        return `a:has-text("${(el as HTMLElement).innerText?.trim().slice(0, 30)}")`
      }

      function getXPath(el: Element): string {
        if (el.id) return `//*[@id="${el.id}"]`
        const parts: string[] = []
        let current: Element | null = el
        while (current && current.nodeType === Node.ELEMENT_NODE) {
          let index = 1
          let sibling: Element | null = current.previousElementSibling
          while (sibling) {
            if (sibling.tagName === current.tagName) index++
            sibling = sibling.previousElementSibling
          }
          parts.unshift(`${current.tagName.toLowerCase()}[${index}]`)
          current = current.parentElement
        }
        return '/' + parts.join('/')
      }

      function getAttributes(el: Element): Record<string, string> {
        const attrs: Record<string, string> = {}
        for (const attr of el.attributes) {
          attrs[attr.name] = attr.value
        }
        return attrs
      }
    }, pageUrl)
  }

  /**
   * Discover all forms on the page
   */
  private async discoverForms(page: Page, pageUrl: string): Promise<DiscoveredElement[]> {
    return page.evaluate((url) => {
      const elements: any[] = []
      const forms = document.querySelectorAll('form')

      forms.forEach((form, index) => {
        const rect = form.getBoundingClientRect()
        const style = window.getComputedStyle(form)

        elements.push({
          id: `form-${index}-${Date.now()}`,
          type: 'form',
          selector: form.id ? `#${form.id}` : `form:nth-of-type(${index + 1})`,
          name: form.name || '',
          action: form.action || '',
          method: form.method || 'get',
          pageUrl: url,
          xpath: getXPath(form),
          attributes: getAttributes(form),
          isVisible: style.display !== 'none' && style.visibility !== 'hidden',
          isEnabled: true,
          boundingBox: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          }
        })
      })

      return elements

      function getXPath(el: Element): string {
        if (el.id) return `//*[@id="${el.id}"]`
        const parts: string[] = []
        let current: Element | null = el
        while (current && current.nodeType === Node.ELEMENT_NODE) {
          let index = 1
          let sibling: Element | null = current.previousElementSibling
          while (sibling) {
            if (sibling.tagName === current.tagName) index++
            sibling = sibling.previousElementSibling
          }
          parts.unshift(`${current.tagName.toLowerCase()}[${index}]`)
          current = current.parentElement
        }
        return '/' + parts.join('/')
      }

      function getAttributes(el: Element): Record<string, string> {
        const attrs: Record<string, string> = {}
        for (const attr of el.attributes) {
          attrs[attr.name] = attr.value
        }
        return attrs
      }
    }, pageUrl)
  }

  /**
   * Discover all input elements
   */
  private async discoverInputs(page: Page, pageUrl: string): Promise<DiscoveredElement[]> {
    return page.evaluate((url) => {
      const elements: any[] = []
      const inputs = document.querySelectorAll('input:not([type="submit"]):not([type="button"]):not([type="hidden"]):not([type="checkbox"]):not([type="radio"])')

      inputs.forEach((input, index) => {
        const inp = input as HTMLInputElement
        const rect = inp.getBoundingClientRect()
        const style = window.getComputedStyle(inp)

        elements.push({
          id: `input-${index}-${Date.now()}`,
          type: 'input',
          selector: generateSelector(inp),
          name: inp.name || '',
          placeholder: inp.placeholder || '',
          ariaLabel: inp.getAttribute('aria-label') || '',
          dataTestId: inp.getAttribute('data-testid') || '',
          pageUrl: url,
          xpath: getXPath(inp),
          attributes: getAttributes(inp),
          isVisible: style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0,
          isEnabled: !inp.disabled,
          boundingBox: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          },
          parentForm: inp.form?.id || inp.closest('form')?.id || undefined
        })
      })

      return elements

      function generateSelector(el: Element): string {
        if (el.id) return `#${el.id}`
        if (el.getAttribute('data-testid')) return `[data-testid="${el.getAttribute('data-testid')}"]`
        if (el.getAttribute('name')) return `input[name="${el.getAttribute('name')}"]`
        const type = el.getAttribute('type') || 'text'
        return `input[type="${type}"]`
      }

      function getXPath(el: Element): string {
        if (el.id) return `//*[@id="${el.id}"]`
        const parts: string[] = []
        let current: Element | null = el
        while (current && current.nodeType === Node.ELEMENT_NODE) {
          let index = 1
          let sibling: Element | null = current.previousElementSibling
          while (sibling) {
            if (sibling.tagName === current.tagName) index++
            sibling = sibling.previousElementSibling
          }
          parts.unshift(`${current.tagName.toLowerCase()}[${index}]`)
          current = current.parentElement
        }
        return '/' + parts.join('/')
      }

      function getAttributes(el: Element): Record<string, string> {
        const attrs: Record<string, string> = {}
        for (const attr of el.attributes) {
          attrs[attr.name] = attr.value
        }
        return attrs
      }
    }, pageUrl)
  }

  /**
   * Discover select elements
   */
  private async discoverSelects(page: Page, pageUrl: string): Promise<DiscoveredElement[]> {
    return page.evaluate((url) => {
      const elements: any[] = []
      const selects = document.querySelectorAll('select')

      selects.forEach((select, index) => {
        const sel = select as HTMLSelectElement
        const rect = sel.getBoundingClientRect()
        const style = window.getComputedStyle(sel)

        elements.push({
          id: `select-${index}-${Date.now()}`,
          type: 'select',
          selector: sel.id ? `#${sel.id}` : (sel.name ? `select[name="${sel.name}"]` : `select:nth-of-type(${index + 1})`),
          name: sel.name || '',
          ariaLabel: sel.getAttribute('aria-label') || '',
          dataTestId: sel.getAttribute('data-testid') || '',
          pageUrl: url,
          xpath: getXPath(sel),
          attributes: getAttributes(sel),
          isVisible: style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0,
          isEnabled: !sel.disabled,
          boundingBox: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          },
          parentForm: sel.form?.id || sel.closest('form')?.id || undefined
        })
      })

      return elements

      function getXPath(el: Element): string {
        if (el.id) return `//*[@id="${el.id}"]`
        const parts: string[] = []
        let current: Element | null = el
        while (current && current.nodeType === Node.ELEMENT_NODE) {
          let index = 1
          let sibling: Element | null = current.previousElementSibling
          while (sibling) {
            if (sibling.tagName === current.tagName) index++
            sibling = sibling.previousElementSibling
          }
          parts.unshift(`${current.tagName.toLowerCase()}[${index}]`)
          current = current.parentElement
        }
        return '/' + parts.join('/')
      }

      function getAttributes(el: Element): Record<string, string> {
        const attrs: Record<string, string> = {}
        for (const attr of el.attributes) {
          attrs[attr.name] = attr.value
        }
        return attrs
      }
    }, pageUrl)
  }

  /**
   * Discover textarea elements
   */
  private async discoverTextareas(page: Page, pageUrl: string): Promise<DiscoveredElement[]> {
    return page.evaluate((url) => {
      const elements: any[] = []
      const textareas = document.querySelectorAll('textarea')

      textareas.forEach((textarea, index) => {
        const ta = textarea as HTMLTextAreaElement
        const rect = ta.getBoundingClientRect()
        const style = window.getComputedStyle(ta)

        elements.push({
          id: `textarea-${index}-${Date.now()}`,
          type: 'textarea',
          selector: ta.id ? `#${ta.id}` : (ta.name ? `textarea[name="${ta.name}"]` : `textarea:nth-of-type(${index + 1})`),
          name: ta.name || '',
          placeholder: ta.placeholder || '',
          ariaLabel: ta.getAttribute('aria-label') || '',
          dataTestId: ta.getAttribute('data-testid') || '',
          pageUrl: url,
          xpath: getXPath(ta),
          attributes: getAttributes(ta),
          isVisible: style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0,
          isEnabled: !ta.disabled,
          boundingBox: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          },
          parentForm: ta.form?.id || ta.closest('form')?.id || undefined
        })
      })

      return elements

      function getXPath(el: Element): string {
        if (el.id) return `//*[@id="${el.id}"]`
        const parts: string[] = []
        let current: Element | null = el
        while (current && current.nodeType === Node.ELEMENT_NODE) {
          let index = 1
          let sibling: Element | null = current.previousElementSibling
          while (sibling) {
            if (sibling.tagName === current.tagName) index++
            sibling = sibling.previousElementSibling
          }
          parts.unshift(`${current.tagName.toLowerCase()}[${index}]`)
          current = current.parentElement
        }
        return '/' + parts.join('/')
      }

      function getAttributes(el: Element): Record<string, string> {
        const attrs: Record<string, string> = {}
        for (const attr of el.attributes) {
          attrs[attr.name] = attr.value
        }
        return attrs
      }
    }, pageUrl)
  }

  /**
   * Discover checkboxes and radio buttons
   */
  private async discoverCheckboxesAndRadios(page: Page, pageUrl: string): Promise<DiscoveredElement[]> {
    return page.evaluate((url) => {
      const elements: any[] = []
      const inputs = document.querySelectorAll('input[type="checkbox"], input[type="radio"]')

      inputs.forEach((input, index) => {
        const inp = input as HTMLInputElement
        const rect = inp.getBoundingClientRect()
        const style = window.getComputedStyle(inp)
        const type = inp.type as 'checkbox' | 'radio'

        // Get associated label
        let labelText = ''
        if (inp.id) {
          const label = document.querySelector(`label[for="${inp.id}"]`)
          if (label) labelText = (label as HTMLElement).innerText?.trim() || ''
        }
        if (!labelText) {
          const parentLabel = inp.closest('label')
          if (parentLabel) labelText = parentLabel.innerText?.trim() || ''
        }

        elements.push({
          id: `${type}-${index}-${Date.now()}`,
          type: type,
          selector: inp.id ? `#${inp.id}` : (inp.name ? `input[name="${inp.name}"]` : `input[type="${type}"]:nth-of-type(${index + 1})`),
          name: inp.name || '',
          text: labelText,
          ariaLabel: inp.getAttribute('aria-label') || '',
          dataTestId: inp.getAttribute('data-testid') || '',
          pageUrl: url,
          xpath: getXPath(inp),
          attributes: getAttributes(inp),
          isVisible: style.display !== 'none' && style.visibility !== 'hidden',
          isEnabled: !inp.disabled,
          boundingBox: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          },
          parentForm: inp.form?.id || inp.closest('form')?.id || undefined
        })
      })

      return elements

      function getXPath(el: Element): string {
        if (el.id) return `//*[@id="${el.id}"]`
        const parts: string[] = []
        let current: Element | null = el
        while (current && current.nodeType === Node.ELEMENT_NODE) {
          let index = 1
          let sibling: Element | null = current.previousElementSibling
          while (sibling) {
            if (sibling.tagName === current.tagName) index++
            sibling = sibling.previousElementSibling
          }
          parts.unshift(`${current.tagName.toLowerCase()}[${index}]`)
          current = current.parentElement
        }
        return '/' + parts.join('/')
      }

      function getAttributes(el: Element): Record<string, string> {
        const attrs: Record<string, string> = {}
        for (const attr of el.attributes) {
          attrs[attr.name] = attr.value
        }
        return attrs
      }
    }, pageUrl)
  }

  /**
   * Analyze forms in detail for comprehensive test generation
   */
  async analyzeForm(page: Page, formSelector: string): Promise<FormAnalysis | null> {
    const formElement = await page.$(formSelector)
    if (!formElement) return null

    const analysis = await page.evaluate((selector) => {
      const form = document.querySelector(selector) as HTMLFormElement
      if (!form) return null

      const fields: any[] = []
      const inputs = form.querySelectorAll('input, select, textarea')

      inputs.forEach(input => {
        const inp = input as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        const type = inp.tagName.toLowerCase() === 'select' ? 'select' :
          inp.tagName.toLowerCase() === 'textarea' ? 'textarea' :
            (inp as HTMLInputElement).type || 'text'

        let options: string[] = []
        if (inp.tagName.toLowerCase() === 'select') {
          options = Array.from((inp as HTMLSelectElement).options).map(o => o.value)
        }

        fields.push({
          name: inp.name,
          type: type,
          required: inp.hasAttribute('required'),
          pattern: inp.getAttribute('pattern'),
          min: inp.getAttribute('min'),
          max: inp.getAttribute('max'),
          minLength: inp.getAttribute('minlength'),
          maxLength: inp.getAttribute('maxlength'),
          options: options
        })
      })

      const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]')

      return {
        action: form.action,
        method: form.method,
        fields: fields,
        hasSubmitButton: !!submitBtn,
        submitButtonText: submitBtn ? (submitBtn as HTMLElement).innerText?.trim() || (submitBtn as HTMLInputElement).value : ''
      }
    }, formSelector)

    return analysis as FormAnalysis | null
  }
}

export default ElementDiscovery
