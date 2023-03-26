class InteractiveTagSelector {
  PATH_FILE = 'tmp/interactiveTagSelector.txt'
  AREA_ID = 'interactive-tag-selector'
  SELECT_ID = 'interactive-tag-selector-select'
  CONTENT_ID = 'interactive-tag-selector-content'
  TO_NEGATIVE_PROMPT_ID = 'interactive-tag-selector-to-negative-prompt'

  constructor(yaml, gradioApp) {
    this.yaml = yaml
    this.gradioApp = gradioApp
    this.visible = false
    this.toNegative = false
  }

  async readFile(filepath) {
    const response = await fetch(`file=${filepath}?${new Date().getTime()}`);

    return await response.text();
  }

  createTagButtons(tags, prefix = '') {
    if (Array.isArray(tags)) {
      return tags.map((tag) => this.createTagButton(tag, tag, 'secondary'))
    } else {
      return Object.keys(tags).map((key) => {
        const values = tags[key]
        const randomKey = `${prefix}:${key}`

        if (typeof values === 'string') { return this.createTagButton(key, values, 'secondary') }

        const group = document.createElement('div')
        group.classList.add('gr-block', 'gr-box', 'relative', 'w-full', 'border-solid', 'border', 'border-gray-200', 'flex', 'flex-col', 'col', 'flex-wrap', 'gap-2', 'p-2')
        group.style = `min-width: min(320px, 100%); flex-basis: 50%; flex-grow: 1;`
        group.append(this.createTagButton(key, `@${randomKey}@`))
        group.insertAdjacentHTML('beforeend', '<div class="flex flex-col buttons"></div>')

        const buttons = group.querySelector('.buttons')
        buttons.classList.add('gr-block', 'gr-box', 'relative', 'w-full', 'flex', 'flex-wrap')
        buttons.style = 'flex-direction: initial;'

        this.createTagButtons(values, randomKey).forEach((button) => {
          buttons.appendChild(button)
        })

        return group
      })
    }
  }

  createTagButton(title, value, color = 'primary') {
    const button = document.createElement('button')
    button.classList.add('gr-button', 'gr-button-sm', `gr-button-${color}`)
    button.style = 'height: 2rem; flex-grow: 0; margin: 2px;'
    button.textContent = title
    button.addEventListener('click', () => { this.addTag(value) })

    return button
  }

  createTagArea(tags = {}) {
    const tagArea = document.createElement('div')
    tagArea.id = this.AREA_ID
    tagArea.classList.add('flex', 'flex-col', 'relative', 'col', 'gr-panel')
    tagArea.style = 'display: none;'

    tagArea.innerHTML = `
      <div class="flex flex-col relative col">
        <div class="gr-block gr-box relative w-full border-solid border border-gray-200">
          <div class="flex flex-row flex-wrap w-full gap-2" style="align-items: center;">
            <select id="${this.SELECT_ID}" class="gr-box gr-input w-full" style="min-width: min(400px, 100%); flex: 3;">
              <option>Nothing</option>
            </select>
            <div style="min-width: min(200px, 100%); flex: 1">
              <label class="flex items-center text-gray-700 text-sm space-x-2 rounded-lg cursor-pointer dark:bg-transparent">
                <input type="checkbox" id="${this.TO_NEGATIVE_PROMPT_ID}" class="gr-check-radio gr-checkbox">
                <span class="ml-2">Add to Neg-Prompt</span>
              </label>
            </div>
          </div>
          <div id="${this.CONTENT_ID}" class="flex flex-row flex-wrap"></div>
        </div>
      </div>
    `
    const select = tagArea.querySelector(`#${this.SELECT_ID}`)
    const content = tagArea.querySelector(`#${this.CONTENT_ID}`)
    const toNegativePromptCheckbox = tagArea.querySelector(`#${this.TO_NEGATIVE_PROMPT_ID}`)

    Object.keys(tags).forEach((key) => {
      const values = tags[key]

      const option = document.createElement('option')
      option.value = key
      option.textContent = key
      select.appendChild(option)

      const container = document.createElement('div')
      container.id = `interactive-tag-selector-container-${key}`
      container.classList.add('flex', 'flex-row', 'flex-wrap')
      container.style = 'display: none;'

      this.createTagButtons(values, key).forEach((group) => {
        container.appendChild(group)
      })

      content.appendChild(container)
    })

    select.addEventListener('change', (event) => {
      const selected = event.target.value
      Array.from(content.childNodes).forEach((node) => {
        const visible = node.id === `interactive-tag-selector-container-${selected}`
        this.changeVisibility(node, visible)
      })
    })

    toNegativePromptCheckbox.addEventListener('change', (event) => {
      this.toNegative = event.target.checked
    })


    gradioApp().getElementById('txt2img_toprow').after(tagArea)
  }

  changeVisibility(node, visible) {
    const style = visible ? 'display: flex;' : 'display: none;'
    node.style = style
  }

  addTag(tag) {
    const id = this.toNegative ? 'txt2img_neg_prompt' : 'txt2img_prompt'
    const textarea = gradioApp().getElementById(id).querySelector('textarea')
    const prompt_area = gradioApp().getElementById("txt2img_prompt").querySelector('textarea')
    const net_prompt_area = gradioApp().getElementById("txt2img_neg_prompt").querySelector('textarea')

    //Check if a tag starts with "neg-", remove this "neg-", then add it to neg-prompt. 
    //There is no need to ask user click a checkbox manually
    //Also, 
    if (tag.startsWith("neg-")) {
      let neg_tag = tag.substring(4);
      //check if it is already in prompt
      if (net_prompt_area.value.indexOf(", "+neg_tag)>=0) {
        // remove from prompt
        net_prompt_area.value = net_prompt_area.value.replace(", "+neg_tag, "");
      } else if(net_prompt_area.value.indexOf(neg_tag)==0) {
        net_prompt_area.value = net_prompt_area.value.replace(neg_tag, "");
      } else {
        // add to prompt
        if (net_prompt_area.value.trim() !== '' && net_prompt_area.value.trim().slice(-1) !== ',') { net_prompt_area.value += ', ' }
        net_prompt_area.value += neg_tag;
      }

      //trigger
      net_prompt_area.dispatchEvent(new Event("input"));

    } else {
      //check if it is already in prompt
      if (textarea.value.indexOf(", "+tag)>=0) {
        // remove from prompt
        textarea.value = textarea.value.replace(", "+tag, "");
      } else if (textarea.value.indexOf(tag)==0) {
        // remove from prompt
        textarea.value = textarea.value.replace(tag, "");
      } else {
        // add to prompt
        if (textarea.value.trim() !== '' && textarea.value.trim().slice(-1) !== ',') { textarea.value += ', ' }
        textarea.value += tag
      }

      //trigger
      textarea.dispatchEvent(new Event("input"));


    }

  }

  async parseFiles() {
    const text = await this.readFile(this.PATH_FILE);
    if (text === '') { return {} }

    const paths = text.split(/\r\n|\n/)

    const tags = {}
    for (const path of paths) {
      const filename = path.split('/').pop().split('.').shift()
      const data = await this.readFile(path)
      yaml.loadAll(data, function (doc) {
        tags[filename] = doc
      })
    }

    return tags
  }
}

onUiLoaded(async () => {
  yaml = window.jsyaml
  const interactiveTagSelector = new InteractiveTagSelector(yaml, gradioApp())
  const tags = await interactiveTagSelector.parseFiles()

  const button = document.createElement('button')
  button.textContent = '🔯Pick Tag'
  button.classList.add('gr-button', 'gr-button-sm', 'gr-button-secondary')
  button.style = 'margin-top: 0.5rem;'

  button.addEventListener('click', () => {
    const tagArea = gradioApp().querySelector(`#${interactiveTagSelector.AREA_ID}`)
    interactiveTagSelector.changeVisibility(tagArea, interactiveTagSelector.visible = !interactiveTagSelector.visible)
  })

  const txt2imgActionColumn = gradioApp().getElementById('txt2img_actions_column')
  txt2imgActionColumn.appendChild(button)

  interactiveTagSelector.createTagArea(tags)
})
