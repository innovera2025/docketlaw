import { gsap, Expo, Quad, Power2 } from 'gsap'

type XY = { x: number; y: number }

export function initLoginForm() {
  // -------- query helpers with typings --------
  const qs = <T extends Element>(sel: string) => document.querySelector(sel) as T | null

  // elements
  const emailLabel = qs<HTMLLabelElement>('#loginEmailLabel')
  const email = qs<HTMLInputElement>('#loginEmail')
  const passwordLabel = qs<HTMLLabelElement>('#loginPasswordLabel')
  const password = qs<HTMLInputElement>('#loginPassword')
  const showPasswordCheck = qs<HTMLInputElement>('#showPasswordCheck')
  const showPasswordToggle = qs<HTMLLabelElement>('#showPasswordToggle')

  const mySVG = qs<SVGElement>('.svgContainer')
  const twoFingers = qs<SVGElement>('.twoFingers')
  const armL = qs<SVGElement>('.armL')
  const armR = qs<SVGElement>('.armR')
  const eyeL = qs<SVGElement>('.eyeL')
  const eyeR = qs<SVGElement>('.eyeR')
  const nose = qs<SVGElement>('.nose')
  const mouth = qs<SVGElement>('.mouth')
  const mouthBG = qs<SVGPathElement>('.mouthBG')
  const mouthSmallBG = qs<SVGPathElement>('.mouthSmallBG')
  const mouthMediumBG = qs<SVGPathElement>('.mouthMediumBG')
  const mouthLargeBG = qs<SVGPathElement>('.mouthLargeBG')
  const mouthMaskPath = qs<SVGPathElement>('#mouthMaskPath')
  const mouthOutline = qs<SVGPathElement>('.mouthOutline')
  const tooth = qs<SVGElement>('.tooth')
  const tongue = qs<SVGElement>('.tongue')
  const chin = qs<SVGElement>('.chin')
  const face = qs<SVGElement>('.face')
  const eyebrow = qs<SVGElement>('.eyebrow')
  const outerEarL = qs<SVGElement>('.earL .outerEar')
  const outerEarR = qs<SVGElement>('.earR .outerEar')
  const earHairL = qs<SVGElement>('.earL .earHair')
  const earHairR = qs<SVGElement>('.earR .earHair')
  const hair = qs<SVGElement>('.hair')
  const bodyBG = qs<SVGPathElement>('.bodyBGnormal')
  const bodyBGchanged = qs<SVGPathElement>('.bodyBGchanged')

  // guard: all required elements must exist
  const required = [
    emailLabel,
    email,
    password,
    showPasswordCheck,
    showPasswordToggle,
    mySVG,
    twoFingers,
    armL,
    armR,
    eyeL,
    eyeR,
    nose,
    mouth,
    mouthBG,
    mouthSmallBG,
    mouthMediumBG,
    mouthLargeBG,
    mouthMaskPath,
    mouthOutline,
    tooth,
    tongue,
    chin,
    face,
    eyebrow,
    outerEarL,
    outerEarR,
    earHairL,
    earHairR,
    hair,
    bodyBG,
    bodyBGchanged,
  ]
  if (required.some((el) => !el)) {
    console.warn('[login-face] missing DOM elements.')
    return () => void 0
  }

  // non-null assertions after guard
  const _emailLabel = emailLabel!
  const _email = email!
  const _password = password!
  const _showPasswordCheck = showPasswordCheck!
  const _showPasswordToggle = showPasswordToggle!

  const _mySVG = mySVG!
  const _twoFingers = twoFingers!
  const _armL = armL!
  const _armR = armR!
  const _eyeL = eyeL!
  const _eyeR = eyeR!
  const _nose = nose!
  const _mouth = mouth!
  const _mouthBG = mouthBG!
  const _mouthSmallBG = mouthSmallBG!
  const _mouthMediumBG = mouthMediumBG!
  const _mouthLargeBG = mouthLargeBG!
  const _mouthMaskPath = mouthMaskPath!
  const _mouthOutline = mouthOutline!
  const _tooth = tooth!
  const _tongue = tongue!
  const _chin = chin!
  const _face = face!
  const _eyebrow = eyebrow!
  const _outerEarL = outerEarL!
  const _outerEarR = outerEarR!
  const _earHairL = earHairL!
  const _earHairR = earHairR!
  const _hair = hair!
  const _bodyBG = bodyBG!
  const _bodyBGchanged = bodyBGchanged!

  // -------- state --------
  let activeElement: 'email' | 'password' | 'toggle' | null = null
  let curEmailIndex = 0
  let screenCenter = 0
  let svgCoords: XY = { x: 0, y: 0 }
  let emailCoords: XY = { x: 0, y: 0 }
  let emailScrollMax = 0
  const chinMin = 0.5
  let dFromC = 0
  let mouthStatus: 'small' | 'medium' | 'large' = 'small'
  let blinking: gsap.core.Tween | null = null
  let eyeScale = 1
  let eyesCovered = false
  let showPasswordClicked = false

  let eyeLCoords: XY, eyeRCoords: XY, noseCoords: XY, mouthCoords: XY
  let eyeLAngle = 0,
    eyeLX = 0,
    eyeLY = 0
  let eyeRAngle = 0,
    eyeRX = 0,
    eyeRY = 0
  let noseAngle = 0,
    noseX = 0,
    noseY = 0
  let mouthAngle = 0,
    mouthX = 0,
    mouthY = 0,
    mouthR = 0
  let chinX = 0,
    chinY = 0,
    chinS = 1
  let faceX = 0,
    faceY = 0,
    faceSkew = 0,
    eyebrowSkew = 0
  let outerEarX = 0,
    outerEarY = 0,
    hairX = 0,
    hairS = 1.2

  // -------- utils --------
  function getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max))
  }

  function getAngle(x1: number, y1: number, x2: number, y2: number) {
    return Math.atan2(y1 - y2, x1 - x2)
  }

  function getPosition(el: Element): XY {
    let xPos = 0
    let yPos = 0
    let node: any = el as HTMLElement | null
    while (node) {
      if (node.tagName === 'BODY') {
        const xScroll = node.scrollLeft || document.documentElement.scrollLeft
        const yScroll = node.scrollTop || document.documentElement.scrollTop
        xPos += node.offsetLeft - xScroll + node.clientLeft
        yPos += node.offsetTop - yScroll + node.clientTop
      } else {
        xPos += node.offsetLeft - node.scrollLeft + node.clientLeft
        yPos += node.offsetTop - node.scrollTop + node.clientTop
      }
      node = node.offsetParent
    }
    return { x: xPos, y: yPos }
  }

  function isMobileDevice() {
    const a = (navigator.userAgent || (navigator as any).vendor || (window as any).opera) as string
    const re =
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i
    const re2 =
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i
    return re.test(a) || re2.test(a.substr(0, 4))
  }

  // -------- core behaviors --------
  function calculateFaceMove() {
    let carPos = _email.selectionEnd
    const div = document.createElement('div')
    const span = document.createElement('span')
    const copyStyle = getComputedStyle(_email)
    let caretCoords: XY = { x: 0, y: 0 }

    if (carPos == null || carPos === 0) carPos = _email.value.length
    ;(Array.prototype.slice.call(copyStyle) as string[]).forEach((prop) => {
      // @ts-expect-error - dynamic style copy
      div.style[prop] = (copyStyle as any)[prop]
    })
    div.style.position = 'absolute'
    document.body.appendChild(div)

    div.textContent = _email.value.substr(0, carPos)
    span.textContent = _email.value.substr(carPos) || '.'
    div.appendChild(span)

    if (_email.scrollWidth <= emailScrollMax) {
      caretCoords = getPosition(span)
      dFromC = screenCenter - (caretCoords.x + emailCoords.x)
      eyeLAngle = getAngle(
        eyeLCoords.x,
        eyeLCoords.y,
        emailCoords.x + caretCoords.x,
        emailCoords.y + 25,
      )
      eyeRAngle = getAngle(
        eyeRCoords.x,
        eyeRCoords.y,
        emailCoords.x + caretCoords.x,
        emailCoords.y + 25,
      )
      noseAngle = getAngle(
        noseCoords.x,
        noseCoords.y,
        emailCoords.x + caretCoords.x,
        emailCoords.y + 25,
      )
      mouthAngle = getAngle(
        mouthCoords.x,
        mouthCoords.y,
        emailCoords.x + caretCoords.x,
        emailCoords.y + 25,
      )
    } else {
      const maxX = emailCoords.x + emailScrollMax
      const maxY = emailCoords.y + 25
      eyeLAngle = getAngle(eyeLCoords.x, eyeLCoords.y, maxX, maxY)
      eyeRAngle = getAngle(eyeRCoords.x, eyeRCoords.y, maxX, maxY)
      noseAngle = getAngle(noseCoords.x, noseCoords.y, maxX, maxY)
      mouthAngle = getAngle(mouthCoords.x, mouthCoords.y, maxX, maxY)
    }

    eyeLX = Math.cos(eyeLAngle) * 20
    eyeLY = Math.sin(eyeLAngle) * 10
    eyeRX = Math.cos(eyeRAngle) * 20
    eyeRY = Math.sin(eyeRAngle) * 10
    noseX = Math.cos(noseAngle) * 23
    noseY = Math.sin(noseAngle) * 10
    mouthX = Math.cos(mouthAngle) * 23
    mouthY = Math.sin(mouthAngle) * 10
    mouthR = Math.cos(mouthAngle) * 6
    chinX = mouthX * 0.8
    chinY = mouthY * 0.5
    chinS = 1 - (dFromC * 0.15) / 100
    if (chinS > 1) {
      chinS = 1 - (chinS - 1)
      if (chinS < chinMin) chinS = chinMin
    }
    faceX = mouthX * 0.3
    faceY = mouthY * 0.4
    faceSkew = Math.cos(mouthAngle) * 5
    eyebrowSkew = Math.cos(mouthAngle) * 25
    outerEarX = Math.cos(mouthAngle) * 4
    outerEarY = Math.cos(mouthAngle) * 5
    hairX = Math.cos(mouthAngle) * 6
    hairS = 1.2

    gsap.to(_eyeL, { duration: 1, x: -eyeLX, y: -eyeLY, ease: Expo.easeOut })
    gsap.to(_eyeR, { duration: 1, x: -eyeRX, y: -eyeRY, ease: Expo.easeOut })
    gsap.to(_nose, {
      duration: 1,
      x: -noseX,
      y: -noseY,
      rotation: mouthR,
      transformOrigin: 'center center',
      ease: Expo.easeOut,
    })
    gsap.to(_mouth, {
      duration: 1,
      x: -mouthX,
      y: -mouthY,
      rotation: mouthR,
      transformOrigin: 'center center',
      ease: Expo.easeOut,
    })
    gsap.to(_chin, { duration: 1, x: -chinX, y: -chinY, scaleY: chinS, ease: Expo.easeOut })
    gsap.to(_face, {
      duration: 1,
      x: -faceX,
      y: -faceY,
      skewX: -faceSkew,
      transformOrigin: 'center top',
      ease: Expo.easeOut,
    })
    gsap.to(_eyebrow, {
      duration: 1,
      x: -faceX,
      y: -faceY,
      skewX: -eyebrowSkew,
      transformOrigin: 'center top',
      ease: Expo.easeOut,
    })
    gsap.to(_outerEarL, { duration: 1, x: outerEarX, y: -outerEarY, ease: Expo.easeOut })
    gsap.to(_outerEarR, { duration: 1, x: outerEarX, y: outerEarY, ease: Expo.easeOut })
    gsap.to(_earHairL, { duration: 1, x: -outerEarX, y: -outerEarY, ease: Expo.easeOut })
    gsap.to(_earHairR, { duration: 1, x: -outerEarX, y: outerEarY, ease: Expo.easeOut })
    gsap.to(_hair, {
      duration: 1,
      x: hairX,
      scaleY: hairS,
      transformOrigin: 'center bottom',
      ease: Expo.easeOut,
    })

    document.body.removeChild(div)
  }

  function onEmailInput() {
    calculateFaceMove()
    const value = _email.value
    curEmailIndex = value.length

    if (curEmailIndex > 0) {
      if (mouthStatus === 'small') {
        mouthStatus = 'medium'
        // ถ้าใช้ MorphSVG ให้เปิด morphSVG:
        // gsap.to([_mouthBG, _mouthOutline, _mouthMaskPath], { duration: 1, morphSVG: _mouthMediumBG, ease: Expo.easeOut })
        gsap.to([_tooth, _tongue], { duration: 1, x: 0, y: 1, ease: Expo.easeOut })
        gsap.to([_eyeL, _eyeR], { duration: 1, scaleX: 0.85, scaleY: 0.85, ease: Expo.easeOut })
        eyeScale = 0.85
      }
      if (value.includes('@')) {
        mouthStatus = 'large'
        // gsap.to([_mouthBG, _mouthOutline, _mouthMaskPath], { duration: 1, morphSVG: _mouthLargeBG, ease: Expo.easeOut })
        gsap.to(_tooth, { duration: 1, x: 3, y: -2, ease: Expo.easeOut })
        gsap.to(_tongue, { duration: 1, y: 2, ease: Expo.easeOut })
        gsap.to([_eyeL, _eyeR], {
          duration: 1,
          scaleX: 0.65,
          scaleY: 0.65,
          transformOrigin: 'center center',
          ease: Expo.easeOut,
        })
        eyeScale = 0.65
      } else {
        mouthStatus = 'medium'
        // gsap.to([_mouthBG, _mouthOutline, _mouthMaskPath], { duration: 1, morphSVG: _mouthMediumBG, ease: Expo.easeOut })
        gsap.to(_tooth, { duration: 1, x: 0, y: 0, ease: Expo.easeOut })
        gsap.to(_tongue, { duration: 1, x: 0, y: 1, ease: Expo.easeOut })
        gsap.to([_eyeL, _eyeR], { duration: 1, scaleX: 0.85, scaleY: 0.85, ease: Expo.easeOut })
        eyeScale = 0.85
      }
    } else {
      mouthStatus = 'small'
      // gsap.to([_mouthBG, _mouthOutline, _mouthMaskPath], { duration: 1, morphSVG: _mouthSmallBG, ease: Expo.easeOut })
      gsap.to(_tooth, { duration: 1, x: 0, y: 0, ease: Expo.easeOut })
      gsap.to(_tongue, { duration: 1, y: 0, ease: Expo.easeOut })
      gsap.to([_eyeL, _eyeR], { duration: 1, scaleX: 1, scaleY: 1, ease: Expo.easeOut })
      eyeScale = 1
    }
  }

  function onEmailFocus(e: FocusEvent) {
    activeElement = 'email'
    ;(e.target as HTMLElement).parentElement?.classList.add('focusWithText')
    onEmailInput()
  }

  function onEmailBlur(e: FocusEvent) {
    activeElement = null
    setTimeout(() => {
      if (activeElement === 'email') return
      const target = e.target as HTMLInputElement
      if (!target.value) target.parentElement?.classList.remove('focusWithText')
      resetFace()
    }, 100)
  }

  function onPasswordFocus() {
    activeElement = 'password'
    if (!eyesCovered) coverEyes()
  }
  function onPasswordBlur() {
    activeElement = null
    setTimeout(() => {
      if (activeElement === 'toggle' || activeElement === 'password') return
      uncoverEyes()
    }, 100)
  }
  function onPasswordToggleFocus() {
    activeElement = 'toggle'
    if (!eyesCovered) coverEyes()
  }
  function onPasswordToggleBlur() {
    activeElement = null
    if (!showPasswordClicked) {
      setTimeout(() => {
        if (activeElement === 'password' || activeElement === 'toggle') return
        uncoverEyes()
      }, 100)
    }
  }
  function onPasswordToggleMouseDown() {
    showPasswordClicked = true
  }
  function onPasswordToggleMouseUp() {
    showPasswordClicked = false
  }

  function onPasswordToggleChange(e: Event) {
    setTimeout(() => {
      const checked = (e.target as HTMLInputElement).checked
      if (checked) {
        _password.type = 'text'
        spreadFingers()
      } else {
        _password.type = 'password'
        closeFingers()
      }
    }, 100)
  }
  function onPasswordToggleClick(e: MouseEvent) {
    ;(e.target as HTMLElement).focus()
  }

  function spreadFingers() {
    gsap.to(_twoFingers, {
      duration: 0.35,
      transformOrigin: 'bottom left',
      rotation: 30,
      x: -9,
      y: -2,
      ease: Power2.easeInOut,
    })
  }
  function closeFingers() {
    gsap.to(_twoFingers, {
      duration: 0.35,
      transformOrigin: 'bottom left',
      rotation: 0,
      x: 0,
      y: 0,
      ease: Power2.easeInOut,
    })
  }

  function coverEyes() {
    gsap.killTweensOf([_armL, _armR])
    gsap.set([_armL, _armR], { visibility: 'visible' })
    gsap.to(_armL, { duration: 0.45, x: -93, y: 10, rotation: 0, ease: Quad.easeOut })
    gsap.to(_armR, { duration: 0.45, x: -93, y: 10, rotation: 0, ease: Quad.easeOut, delay: 0.1 })
    // ถ้าใช้ morphSVG ให้เปิด:
    // gsap.to(_bodyBG, { duration: 0.45, morphSVG: _bodyBGchanged, ease: Quad.easeOut })
    eyesCovered = true
  }

  function uncoverEyes() {
    gsap.killTweensOf([_armL, _armR])
    gsap.to(_armL, { duration: 1.35, y: 220, ease: Quad.easeOut })
    gsap.to(_armL, { duration: 1.35, rotation: 105, ease: Quad.easeOut, delay: 0.1 })
    gsap.to(_armR, { duration: 1.35, y: 220, ease: Quad.easeOut })
    gsap.to(_armR, {
      duration: 1.35,
      rotation: -105,
      ease: Quad.easeOut,
      delay: 0.1,
      onComplete: () => void gsap.set([_armL, _armR], { visibility: 'hidden' }),
    })
    // gsap.to(_bodyBG, { duration: 0.45, morphSVG: _bodyBG, ease: Quad.easeOut })
    eyesCovered = false
  }

  function resetFace() {
    gsap.to([_eyeL, _eyeR], { duration: 1, x: 0, y: 0, ease: Expo.easeOut })
    gsap.to(_nose, { duration: 1, x: 0, y: 0, scaleX: 1, scaleY: 1, ease: Expo.easeOut })
    gsap.to(_mouth, { duration: 1, x: 0, y: 0, rotation: 0, ease: Expo.easeOut })
    gsap.to(_chin, { duration: 1, x: 0, y: 0, scaleY: 1, ease: Expo.easeOut })
    gsap.to([_face, _eyebrow], { duration: 1, x: 0, y: 0, skewX: 0, ease: Expo.easeOut })
    gsap.to([_outerEarL, _outerEarR, _earHairL, _earHairR, _hair], {
      duration: 1,
      x: 0,
      y: 0,
      scaleY: 1,
      ease: Expo.easeOut,
    })
  }

  function startBlinking(delay?: number) {
    const d = delay ? getRandomInt(delay) : 1
    blinking = gsap.to([_eyeL, _eyeR], {
      duration: 0.1,
      delay: d,
      scaleY: 0,
      yoyo: true,
      repeat: 1,
      transformOrigin: 'center center',
      onComplete: () => startBlinking(12),
    })
  }

  function stopBlinking() {
    blinking?.kill()
    blinking = null
    gsap.set([_eyeL, _eyeR], { scaleY: eyeScale })
  }

  // -------- init --------
  function init() {
    svgCoords = getPosition(_mySVG)
    emailCoords = getPosition(_email)
    screenCenter = svgCoords.x + _mySVG.clientWidth / 2
    eyeLCoords = { x: svgCoords.x + 84, y: svgCoords.y + 76 }
    eyeRCoords = { x: svgCoords.x + 113, y: svgCoords.y + 76 }
    noseCoords = { x: svgCoords.x + 97, y: svgCoords.y + 81 }
    mouthCoords = { x: svgCoords.x + 100, y: svgCoords.y + 100 }

    // email events
    _email.addEventListener('focus', onEmailFocus)
    _email.addEventListener('blur', onEmailBlur)
    _email.addEventListener('input', onEmailInput)
    _emailLabel.addEventListener('click', () => (activeElement = 'email'))

    // password events
    _password.addEventListener('focus', onPasswordFocus)
    _password.addEventListener('blur', onPasswordBlur)

    // toggle events
    _showPasswordCheck.addEventListener('change', onPasswordToggleChange)
    _showPasswordCheck.addEventListener('focus', onPasswordToggleFocus)
    _showPasswordCheck.addEventListener('blur', onPasswordToggleBlur)
    _showPasswordCheck.addEventListener('click', onPasswordToggleClick)
    _showPasswordToggle.addEventListener('mouseup', onPasswordToggleMouseUp)
    _showPasswordToggle.addEventListener('mousedown', onPasswordToggleMouseDown)

    // initial arms & mouth origin
    gsap.set(_armL, { x: -93, y: 220, rotation: 105, transformOrigin: 'top left' })
    gsap.set(_armR, { x: -93, y: 220, rotation: -105, transformOrigin: 'top right' })
    gsap.set(_mouth, { transformOrigin: 'center center' })

    startBlinking(5)

    // max scroll width baseline
    emailScrollMax = _email.scrollWidth

    // mobile: show password by default
    if (isMobileDevice()) {
      _password.type = 'text'
      _showPasswordCheck.checked = true
      gsap.set(_twoFingers, {
        transformOrigin: 'bottom left',
        rotation: 30,
        x: -9,
        y: -2,
        ease: Power2.easeInOut,
      })
    }

    // console.clear(); // เอาออกเพื่อไม่ล้าง console ของ devtools
  }

  init()

  // -------- cleanup for Vue onBeforeUnmount --------
  const cleanup = () => {
    stopBlinking()
    _email.removeEventListener('focus', onEmailFocus)
    _email.removeEventListener('blur', onEmailBlur)
    _email.removeEventListener('input', onEmailInput)

    _password.removeEventListener('focus', onPasswordFocus)
    _password.removeEventListener('blur', onPasswordBlur)

    _showPasswordCheck.removeEventListener('change', onPasswordToggleChange)
    _showPasswordCheck.removeEventListener('focus', onPasswordToggleFocus)
    _showPasswordCheck.removeEventListener('blur', onPasswordToggleBlur)
    _showPasswordCheck.removeEventListener('click', onPasswordToggleClick)
    _showPasswordToggle.removeEventListener('mouseup', onPasswordToggleMouseUp)
    _showPasswordToggle.removeEventListener('mousedown', onPasswordToggleMouseDown)
  }

  return cleanup
}
