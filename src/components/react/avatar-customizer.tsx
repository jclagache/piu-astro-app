import React, { useState, useEffect, useRef, useCallback } from 'react'
import { RxReset, RxDownload} from "react-icons/rx";
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from "@/components/ui/label"
import { GiCharacter } from "react-icons/gi";
import { PiSelectionBackgroundBold } from "react-icons/pi";
import { MdColorize } from "react-icons/md";

interface AvatarCustomizerProps {
  baseImageSrc: string
  onColorChange?: (characterHue: number, backgroundColor: string) => void
}

export function AvatarCustomizer({ baseImageSrc, onColorChange }: AvatarCustomizerProps) {
  // Character color presets - 11 colors including original
  const characterColorPresets = [
    { name: 'Original', color: '#4d6a8e', value: 'original' },
    { name: 'Red', color: '#dc2626', value: '#dc2626' },
    { name: 'Orange', color: '#ea580c', value: '#ea580c' },
    { name: 'Yellow', color: '#ca8a04', value: '#ca8a04' },
    { name: 'Green', color: '#16a34a', value: '#16a34a' },
    { name: 'Cyan', color: '#0891b2', value: '#0891b2' },
    { name: 'Blue', color: '#2563eb', value: '#2563eb' },
    { name: 'Purple', color: '#9333ea', value: '#9333ea' },
    { name: 'Pink', color: '#db2777', value: '#db2777' },
    { name: 'Brown', color: '#92400e', value: '#92400e' },
    { name: 'Gray', color: '#4b5563', value: '#4b5563' }
  ]

  // Background color presets - 11 colors including original
  const backgroundColorPresets = [
    { name: 'Original', color: 'transparent', value: 'original' },
    { name: 'White', color: '#ffffff', value: '#ffffff' },
    { name: 'Cream', color: '#fef7ed', value: '#fef7ed' },
    { name: 'Sky', color: '#7dd3fc', value: '#7dd3fc' },
    { name: 'Mint', color: '#6ee7b7', value: '#6ee7b7' },
    { name: 'Lavender', color: '#c4b5fd', value: '#c4b5fd' },
    { name: 'Rose', color: '#fda4af', value: '#fda4af' },
    { name: 'Peach', color: '#fdba74', value: '#fdba74' },
    { name: 'Slate', color: '#94a3b8', value: '#94a3b8' },
    { name: 'Navy', color: '#1e293b', value: '#1e293b' },
    { name: 'Black', color: '#000000', value: '#000000' }
  ]

  const [selectedCharacterColor, setSelectedCharacterColor] = useState('original')
  const [backgroundColor, setBackgroundColor] = useState(backgroundColorPresets.find(p => p.name === 'Original')?.value || 'original')
  const [contrastLevel, setContrastLevel] = useState(1.0) // Range factor pour les variations de couleur (1.0 = similar to original)
  const svgRef = useRef<HTMLDivElement>(null)
  const [svgContent, setSvgContent] = useState('')

  const handleCharacterColorChange = (value: string) => {
    setSelectedCharacterColor(value)
    setContrastLevel(1.0) // Reset to default contrast level
    onColorChange?.(0, backgroundColor)
  }

  const handleBackgroundColorChange = (value: string) => {
    setBackgroundColor(value)
    onColorChange?.(0, value)
  }

  const resetToDefault = () => {
    const defaultBackgroundColor = backgroundColorPresets.find(p => p.name === 'Original')?.value || 'original'
    setSelectedCharacterColor('original')
    setBackgroundColor(defaultBackgroundColor)
    onColorChange?.(0, defaultBackgroundColor)
  }

  // Download the current avatar as PNG
  const downloadAvatar = async () => {
    try {
      const svgElement = svgRef.current?.querySelector('svg')
      if (!svgElement) {
        alert('Avatar not ready for download. Please wait for it to load.')
        return
      }

      // Get indices for filename (use 0 if not found)
      const characterIndex = Math.max(0, characterColorPresets.findIndex(preset => preset.value === selectedCharacterColor))
      const backgroundIndex = Math.max(0, backgroundColorPresets.findIndex(preset => preset.value === backgroundColor))
      const filename = `piu_${characterIndex}_${backgroundIndex}.png`
      

      // Create a canvas element with high resolution
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        alert('Unable to create canvas for download.')
        return
      }

      // Set image resolution to 1000x1000 pixels
      const size = 1000 // High resolution as requested
      canvas.width = size
      canvas.height = size

      // Get the current SVG bounds
      const svgRect = svgElement.getBoundingClientRect()
      const svgViewBox = svgElement.getAttribute('viewBox')?.split(' ') || ['0', '0', '400', '400']
      
      // Clone the SVG to capture current state
      const svgClone = svgElement.cloneNode(true) as SVGElement
      
      // Ensure proper dimensions and viewBox
      svgClone.setAttribute('width', size.toString())
      svgClone.setAttribute('height', size.toString())
      svgClone.setAttribute('viewBox', svgViewBox.join(' '))
      
      // Add background color rectangle if not original or transparent
      if (backgroundColor !== 'original' && backgroundColor !== 'transparent') {
        const backgroundRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
        backgroundRect.setAttribute('x', '0')
        backgroundRect.setAttribute('y', '0')
        backgroundRect.setAttribute('width', '100%')
        backgroundRect.setAttribute('height', '100%')
        backgroundRect.setAttribute('fill', backgroundColor)
        svgClone.insertBefore(backgroundRect, svgClone.firstChild)
      }

      // Convert to blob and then to object URL
      const svgData = new XMLSerializer().serializeToString(svgClone)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const svgUrl = URL.createObjectURL(svgBlob)

      // Create image and load SVG
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        try {
          // Set background if not original or transparent
          if (backgroundColor !== 'original' && backgroundColor !== 'transparent') {
            ctx.fillStyle = backgroundColor
            ctx.fillRect(0, 0, size, size)
          }

          // Draw the SVG
          ctx.drawImage(img, 0, 0, size, size)

          // Convert to PNG and download
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = url
              link.download = filename
              link.style.display = 'none'
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              URL.revokeObjectURL(url)
            } else {
              alert('Failed to create PNG file.')
            }
          }, 'image/png', 0.95) // High quality PNG

          // Clean up
          URL.revokeObjectURL(svgUrl)
        } catch (error) {
          console.error('Error during image processing:', error)
          alert('Error processing image for download.')
          URL.revokeObjectURL(svgUrl)
        }
      }

      img.onerror = () => {
        console.error('Failed to load SVG for download')
        alert('Failed to load avatar for download.')
        URL.revokeObjectURL(svgUrl)
      }

      img.src = svgUrl
    } catch (error) {
      console.error('Download error:', error)
      alert('An error occurred while preparing the download.')
    }
  }

  // Determine if an element should be colorized (main zones) or preserved (details/shadows)
  const isMainCharacterZone = (element: Element, className: string | null, fill: string | null): boolean => {
    // For testing: colorize almost everything to see what happens
    // We can make this more restrictive later if needed
    
    // Get computed color to analyze brightness
    const computedColor = window.getComputedStyle(element).fill
    
    if (computedColor && computedColor !== 'none' && computedColor.startsWith('rgb')) {
      // Parse RGB values
      const matches = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
      if (matches) {
        const [, r, g, b] = matches.map(Number)
        
        // Calculate brightness (0-255)
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114)
        
        // Ultra permissive: colorize ALL zones including pure black
        // Only exclude if brightness is exactly 0 (true void/transparent)
        return brightness >= 0 // Include everything, even pure black zones
      }
    }
    
    // If we can't determine brightness, check class patterns
    if (className) {
      // Ultra permissive - colorize ALL classes including previously excluded ones
      // No more class-based exclusions
      return true // Colorize everything regardless of class
    }
    
    // Default: colorize everything
    return true
  }

  // Convert RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }

    return [h * 360, s * 100, l * 100]
  }

  // Convert HSL to RGB
  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    h /= 360
    s /= 100
    l /= 100

    let r, g, b

    if (s === 0) {
      r = g = b = l
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1/6) return p + (q - p) * 6 * t
        if (t < 1/2) return q
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
        return p
      }

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q

      r = hue2rgb(p, q, h + 1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1/3)
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
  }

  // Create color variations by preserving HSL relationships from original
  const createColorVariation = (baseColor: string, element: Element): string => {
    // Use the stored original color instead of the current computed color
    const originalColor = element.getAttribute('data-original-fill') || window.getComputedStyle(element).fill

    if (originalColor && originalColor.startsWith('rgb')) {
      const matches = originalColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
      if (matches) {
        const [, origR, origG, origB] = matches.map(Number)

        // Parse base color
        const baseR = parseInt(baseColor.slice(1, 3), 16)
        const baseG = parseInt(baseColor.slice(3, 5), 16)
        const baseB = parseInt(baseColor.slice(5, 7), 16)

        // Convert to HSL
        const [origH, origS, origL] = rgbToHsl(origR, origG, origB)
        const [baseH, baseS, baseL] = rgbToHsl(baseR, baseG, baseB)

        // Calculate the lightness ratio relative to the original base color #4d6a8e
        // This preserves the relationship between different shades
        const originalBaseL = 42.5 // Lightness of #4d6a8e

        // Calculate the offset from the original base (how much lighter or darker)
        const lightnessOffset = origL - originalBaseL

        // Apply this offset to the new base color
        const targetL = baseL + lightnessOffset

        // Apply contrast adjustment
        // When contrastLevel = 1.0, use full offset
        // When contrastLevel < 1.0, reduce the offset (move towards baseL)
        // When contrastLevel > 1.0, increase the offset (move away from baseL)
        const adjustedOffset = lightnessOffset * contrastLevel
        let newL = baseL + adjustedOffset

        // Clamp lightness
        newL = Math.max(5, Math.min(95, newL))

        // Preserve saturation variation from original more subtly
        // Map original saturation range to new saturation range
        const baseSaturationOffset = origS - 50 // Offset from middle saturation
        let newS = baseS + (baseSaturationOffset * 0.3) // Apply offset proportionally
        newS = Math.max(0, Math.min(100, newS))

        // Use the hue of the selected color
        const newH = baseH

        // Convert back to RGB
        const [newR, newG, newB] = hslToRgb(newH, newS, newL)

        return `rgb(${newR}, ${newG}, ${newB})`
      }
    }

    // Fallback to base color
    return baseColor
  }


  // Load SVG content once and cache it
  useEffect(() => {
    let isMounted = true
    
    fetch(baseImageSrc)
      .then(response => response.text())
      .then(svgText => {
        if (isMounted) {
          setSvgContent(svgText)
        }
      })
      .catch(error => {
        console.error('Error loading SVG:', error)
      })
    
    return () => {
      isMounted = false
    }
  }, [baseImageSrc])

  // Inject SVG content only once on initial load
  useEffect(() => {
    if (!svgRef.current || !svgContent) return

    // Inject SVG content
    svgRef.current.innerHTML = svgContent

    // Add smooth transition to all SVG elements
    const svg = svgRef.current.querySelector('svg')
    if (svg) {
      const style = document.createElement('style')
      style.textContent = `
        #Head path,
        #Head circle,
        #Head rect,
        #Head polygon {
          transition: fill 0.2s ease-in-out;
        }
      `
      svg.appendChild(style)
    }

    // Store original colors in data attributes
    const headGroup = svgRef.current.querySelector('#Head')
    if (headGroup) {
      const allElements = [
        ...headGroup.querySelectorAll('path'),
        ...headGroup.querySelectorAll('circle'),
        ...headGroup.querySelectorAll('rect'),
        ...headGroup.querySelectorAll('polygon')
      ]

      allElements.forEach((element) => {
        const computedColor = window.getComputedStyle(element).fill
        if (computedColor && computedColor.startsWith('rgb')) {
          // Store the original color as a data attribute
          element.setAttribute('data-original-fill', computedColor)
        }
      })
    }

    // Apply initial colors after a small delay to ensure DOM is ready
    setTimeout(() => {
      updateColors()
    }, 0)
  }, [svgContent])

  // Update colors without re-injecting SVG
  const updateColors = useCallback(() => {
    if (!svgRef.current) return

    const headGroup = svgRef.current.querySelector('#Head')
    if (!headGroup) {
      console.warn('Head group not found in SVG')
      return
    }

    // Find all shape elements in the Head group
    const pathElements = headGroup.querySelectorAll('path')
    const circleElements = headGroup.querySelectorAll('circle')
    const rectElements = headGroup.querySelectorAll('rect')
    const polygonElements = headGroup.querySelectorAll('polygon')

    const allElements = [...pathElements, ...circleElements, ...rectElements, ...polygonElements]

    // Apply exact color to main character zones while preserving detail zones
    allElements.forEach((element) => {
      const currentClass = element.getAttribute('class')
      const currentFill = element.getAttribute('fill')

      if (selectedCharacterColor === 'original') {
        // Restore original colors
        ;(element as unknown as HTMLElement).style.removeProperty('fill')
        element.removeAttribute('fill')
      } else {
        // Determine if this element should be colorized based on its original color
        const shouldColorize = isMainCharacterZone(element, currentClass, currentFill)

        if (shouldColorize) {
          // Apply selected color with slight variations based on original brightness
          const variedColor = createColorVariation(selectedCharacterColor, element)
          ;(element as unknown as HTMLElement).style.fill = variedColor
          element.setAttribute('fill', variedColor)
        } else {
          // Keep detail zones in their original colors
          ;(element as unknown as HTMLElement).style.removeProperty('fill')
          element.removeAttribute('fill')
        }
      }
    })
  }, [selectedCharacterColor, contrastLevel])

  // Apply colors when character color or contrast level changes
  useEffect(() => {
    if (svgContent && svgRef.current) {
      updateColors()
    }
  }, [selectedCharacterColor, contrastLevel, updateColors, svgContent])

  const getCurrentColorDisplay = () => {
    if (selectedCharacterColor === 'original') {
      return characterColorPresets.find(p => p.value === 'original')?.color || '#4d6a8e'
    }
    return selectedCharacterColor
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" size="icon" onClick={resetToDefault}>
        <RxReset />
        </Button>
          <Button 
            onClick={downloadAvatar}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
             <RxDownload /> Download
          </Button>
      </div>
      
      <div className="flex justify-center mb-8">
        <div
          className="transition-all duration-300 relative w-64 h-64"
          style={{ backgroundColor: backgroundColor === 'original' ? 'transparent' : backgroundColor }}
        >
          {/* SVG with direct fill attribute modification */}
          <div 
            ref={svgRef}
            className="w-64 h-64"
            style={{ 
              display: svgContent ? 'block' : 'none'
            }}
          />
          
          {/* Loading placeholder */}
          {!svgContent && (
            <div className="w-64 h-64 bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">Loading...</span>
            </div>
          )}
          
          {/* Border overlay */}
          <div className="absolute inset-0 border-4 border-foreground pointer-events-none"></div>
        </div>
      </div>

      {/* Character color presets display with visual indicator */}
      <div className="text-center">
        <div id= "character-color-presets" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-card border shadow-sm">
        <GiCharacter />
         {characterColorPresets.map((preset, index) => (
             <div
             key={index}
             className={`w-5 h-5 rounded border shadow-sm cursor-pointer hover:scale-110 transition-transform ${
               selectedCharacterColor === preset.value ? 'border-primary border-2 ring-2 ring-primary/50' : 'border-border'
             }`}
             style={{
               backgroundColor: preset.value === 'original' ? '#ffffff' : preset.color,
               backgroundImage: preset.value === 'original'
                 ? 'linear-gradient(45deg, #d0d0d0 25%, transparent 25%, transparent 75%, #d0d0d0 75%, #d0d0d0), linear-gradient(45deg, #d0d0d0 25%, transparent 25%, transparent 75%, #d0d0d0 75%, #d0d0d0)'
                 : 'none',
               backgroundSize: preset.value === 'original' ? '6px 6px' : 'auto',
               backgroundPosition: preset.value === 'original' ? '0 0, 3px 3px' : 'initial'
             }}
             onClick={() => handleCharacterColorChange(preset.value)}
             title={preset.name}
           />
         ))}
         <label className="relative w-5 h-5 rounded border shadow-sm cursor-pointer hover:scale-110 transition-transform bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 flex items-center justify-center" title="Custom color">
           <MdColorize className="text-white text-xs drop-shadow-md" />
           <input
             type="color"
             value={selectedCharacterColor === 'original' ? '#4d6a8e' : selectedCharacterColor}
             onChange={(e) => handleCharacterColorChange(e.target.value)}
             className="absolute opacity-0 w-0 h-0"
           />
         </label>
        </div>
      </div>

      {/* Contrast level slider */}
      {selectedCharacterColor !== 'original' && (
        <div className="text-center">
          <div className="inline-flex flex-col gap-2 px-6 py-4 rounded-lg bg-card border shadow-sm max-w-md">
            <Label htmlFor="contrast-slider" className="text-sm font-medium">
              Contrast Level: {contrastLevel.toFixed(1)}
            </Label>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Low</span>
              <input
                id="contrast-slider"
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={contrastLevel}
                onChange={(e) => setContrastLevel(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <span className="text-xs text-muted-foreground">High</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Adjust to control shadows and highlights
            </p>
          </div>
        </div>
      )}

      <div className="text-center">
        <div id="background-color-presets" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-card border shadow-sm">
         <PiSelectionBackgroundBold />
         {backgroundColorPresets.map((preset, index) => (
             <div
             key={index}
             className={`w-5 h-5 rounded border shadow-sm cursor-pointer hover:scale-110 transition-transform ${
               backgroundColor === preset.value ? 'border-primary border-2 ring-2 ring-primary/50' : 'border-border'
             }`}
             style={{
               backgroundColor: preset.value === 'original' || preset.value === 'transparent' ? '#ffffff' : preset.color,
               backgroundImage: preset.value === 'original' || preset.value === 'transparent'
                 ? 'linear-gradient(45deg, #d0d0d0 25%, transparent 25%, transparent 75%, #d0d0d0 75%, #d0d0d0), linear-gradient(45deg, #d0d0d0 25%, transparent 25%, transparent 75%, #d0d0d0 75%, #d0d0d0)'
                 : 'none',
               backgroundSize: preset.value === 'original' || preset.value === 'transparent' ? '6px 6px' : 'auto',
               backgroundPosition: preset.value === 'original' || preset.value === 'transparent' ? '0 0, 3px 3px' : 'initial'
             }}
             onClick={() => handleBackgroundColorChange(preset.value)}
             title={preset.name}
           />
         ))}
         <label className="relative w-5 h-5 rounded border shadow-sm cursor-pointer hover:scale-110 transition-transform bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 flex items-center justify-center" title="Custom color">
           <MdColorize className="text-white text-xs drop-shadow-md" />
           <input
             type="color"
             value={backgroundColor === 'original' ? '#ffffff' : backgroundColor}
             onChange={(e) => handleBackgroundColorChange(e.target.value)}
             className="absolute opacity-0 w-0 h-0"
           />
         </label>
         </div>
      </div>
    </div>
  )
}

export default AvatarCustomizer