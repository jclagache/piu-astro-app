import React, { useState, useEffect, useRef, useCallback } from 'react'
import { RxReset, RxDownload} from "react-icons/rx";
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from "@/components/ui/label"
import { GiCharacter } from "react-icons/gi";
import { PiSelectionBackgroundBold } from "react-icons/pi";

interface AvatarCustomizerProps {
  baseImageSrc: string
  onColorChange?: (characterHue: number, backgroundColor: string) => void
}

export function AvatarCustomizer({ baseImageSrc, onColorChange }: AvatarCustomizerProps) {
  const [selectedCharacterColor, setSelectedCharacterColor] = useState('original')
  const [backgroundColor, setBackgroundColor] = useState('#f0f0f0')
  const svgRef = useRef<HTMLDivElement>(null)
  const [svgContent, setSvgContent] = useState('')

  // Character color presets optimized for CSS filter transformations
  const characterColorPresets = [
    { name: 'Original', color: '#4d6a8e', value: 'original' }, // Show original blue tone
    { name: 'Red', color: '#fb2323', value: '#fb2323' }, // PIU Red - vibrant and bold
    { name: 'Blue', color: '#5488f8', value: '#5488f8' }, // PIU Blue - bright and energetic
    { name: 'Brown', color: '#a0755a', value: '#a0755a' }, // PIU Brown - warm earth tone
    { name: 'Green', color: '#16a34a', value: '#16a34a' },
    { name: 'Purple', color: '#9333ea', value: '#9333ea' },
    { name: 'Orange', color: '#ea580c', value: '#ea580c' },
    { name: 'Pink', color: '#ec4899', value: '#ec4899' },
    { name: 'Yellow', color: '#eab308', value: '#eab308' },
    { name: 'Cyan', color: '#06b6d4', value: '#06b6d4' },
    { name: 'Dark', color: '#374151', value: '#374151' },
    { name: 'Light', color: '#d1d5db', value: '#d1d5db' }
  ]

  // Background color presets for avatar backgrounds
  const backgroundColorPresets = [
    { name: 'Transparent', color: 'transparent', value: 'transparent' },
    { name: 'White', color: '#ffffff', value: '#ffffff' },
    { name: 'Light Gray', color: '#d0d0d0', value: '#d0d0d0' },
    { name: 'Dark Gray', color: '#374151', value: '#374151' },
    { name: 'Black', color: '#000000', value: '#000000' },
    { name: 'Yellow', color: '#f0d53d', value: '#f0d53d' },
    { name: 'Original', color: '#0b5575', value: '#0b5575' },
    { name: 'Accent', color: '#f40658', value: '#f40658' },
    { name: 'Light Blue', color: '#74ccf2', value: '#74ccf2' },
    { name: 'Pink', color: '#fc97ba', value: '#fc97ba' },
    { name: 'Cream', color: '#fef7ed', value: '#fef7ed' },
    { name: 'Navy', color: '#1e293b', value: '#1e293b' },
  ]

  const handleCharacterColorChange = (value: string) => {
    setSelectedCharacterColor(value)
    onColorChange?.(0, backgroundColor)
  }

  const handleBackgroundColorChange = (value: string) => {
    setBackgroundColor(value)
    onColorChange?.(0, value)
  }

  const resetToDefault = () => {
    setSelectedCharacterColor('original')
    setBackgroundColor('#f0f0f0')
    onColorChange?.(0, '#f0f0f0')
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
      
      // Add background color rectangle if not transparent
      if (backgroundColor !== 'transparent') {
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
          // Set background if not transparent
          if (backgroundColor !== 'transparent') {
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

  // Create color variations based on original element brightness and selected color characteristics
  const createColorVariation = (baseColor: string, element: Element): string => {
    const computedColor = window.getComputedStyle(element).fill
    
    if (computedColor && computedColor.startsWith('rgb')) {
      const matches = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
      if (matches) {
        const [, r, g, b] = matches.map(Number)
        const originalBrightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255
        
        // Special handling for pure black zones (RGB = 0,0,0)
        if (r === 0 && g === 0 && b === 0) {
          // For pure black, use a darker version of the selected color
          const baseR = parseInt(baseColor.slice(1, 3), 16)
          const baseG = parseInt(baseColor.slice(3, 5), 16)
          const baseB = parseInt(baseColor.slice(5, 7), 16)
          
          // Create a darker version (30% of the selected color)
          const darkFactor = 0.3
          const newR = Math.round(baseR * darkFactor)
          const newG = Math.round(baseG * darkFactor)
          const newB = Math.round(baseB * darkFactor)
          
          return `rgb(${newR}, ${newG}, ${newB})`
        }
        
        // Parse base color
        const baseR = parseInt(baseColor.slice(1, 3), 16)
        const baseG = parseInt(baseColor.slice(3, 5), 16)
        const baseB = parseInt(baseColor.slice(5, 7), 16)
        
        // Analyze selected color characteristics
        const selectedBrightness = (baseR * 0.299 + baseG * 0.587 + baseB * 0.114) / 255
        const selectedSaturation = Math.max(baseR, baseG, baseB) - Math.min(baseR, baseG, baseB)
        
        // Adapt factor based on selected color properties
        let baseFactor = 0.2
        let rangeFactor = 1.3
        
        // Special handling for specific colors from our presets
        const colorLower = baseColor.toLowerCase()
        
        // Yellow/orange colors: need wide range to maintain visibility
        if (colorLower === '#ffff00' || colorLower === '#ffa500' || selectedBrightness > 0.8) {
          baseFactor = 0.1 // Allow very dark variations
          rangeFactor = 1.8 // Very wide range
        }
        // PIU Red (#fb2323): vibrant red with good contrast range
        else if (colorLower === '#fb2323') {
          baseFactor = 0.2 // Allow darker reds
          rangeFactor = 1.6 // Wide range for natural variations
        }
        // PIU Blue (#5488f8): bright blue with good dark variation potential
        else if (colorLower === '#5488f8') {
          baseFactor = 0.15 // Allow very dark blues
          rangeFactor = 1.7 // Very wide range for depth
        }
        // PIU Brown (#a0755a): earthy tone needs balanced approach
        else if (colorLower === '#a0755a') {
          baseFactor = 0.3 // Moderate dark limit for browns
          rangeFactor = 1.4 // Good range for natural wood/earth tones
        }
        // Generic red colors: good natural contrast
        else if (colorLower === '#ff0000' || (baseR > 200 && baseG < 100 && baseB < 100)) {
          baseFactor = 0.25
          rangeFactor = 1.4
        }
        // Generic blue colors: can handle darker variations well
        else if (colorLower === '#0000ff' || (baseB > 200 && baseR < 100 && baseG < 100)) {
          baseFactor = 0.2
          rangeFactor = 1.5
        }
        // Green colors: balanced approach
        else if (colorLower === '#00ff00' || (baseG > 200 && baseR < 100 && baseB < 100)) {
          baseFactor = 0.25
          rangeFactor = 1.3
        }
        // Purple/magenta colors: moderate range
        else if (colorLower === '#ff00ff' || (baseR > 150 && baseB > 150 && baseG < 100)) {
          baseFactor = 0.3
          rangeFactor = 1.2
        }
        // Very dark colors: ensure good visibility
        else if (selectedBrightness < 0.3) {
          baseFactor = 0.6 // Ensure better visibility for dark colors
          rangeFactor = 1.2 // Good range for dark colors
        }
        // For saturated colors: moderate range
        else if (selectedSaturation > 150) {
          baseFactor = 0.3
          rangeFactor = 1.2
        }
        // For neutral colors (grays): standard range
        else {
          baseFactor = 0.2
          rangeFactor = 1.3
        }
        
        // Create adaptive factor based on original brightness and selected color
        const factor = baseFactor + originalBrightness * rangeFactor
        
        const newR = Math.max(0, Math.min(255, Math.round(baseR * factor)))
        const newG = Math.max(0, Math.min(255, Math.round(baseG * factor)))
        const newB = Math.max(0, Math.min(255, Math.round(baseB * factor)))
        
        
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

  // Apply direct color changes to SVG fill attributes - much more accurate than CSS filters
  const applyDirectColors = useCallback(() => {
    if (!svgRef.current || !svgContent) return

    // Inject SVG content
    svgRef.current.innerHTML = svgContent

    // Wait for DOM to be ready
    setTimeout(() => {
      const headGroup = svgRef.current?.querySelector('#Head')
      if (!headGroup) {
        console.warn('Head group not found in SVG')
        return
      }


      // Find all shape elements in the Head group
      const pathElements = headGroup.querySelectorAll('path')
      const circleElements = headGroup.querySelectorAll('circle')
      const rectElements = headGroup.querySelectorAll('rect')
      const polygonElements = headGroup.querySelectorAll('polygon')
      
      // Now all elements with CSS classes (cls-1, cls-2, etc.) are part of the character
      // The background is transparent in the new SVG structure
      const allElements = [...pathElements, ...circleElements, ...rectElements, ...polygonElements]
      const elementsWithClasses = allElements.filter(el => {
        const classList = el.getAttribute('class')
        return classList && classList.match(/cls-\d+/)
      })
      const elementsWithoutClasses = allElements.filter(el => {
        const classList = el.getAttribute('class')
        return !classList || !classList.match(/cls-\d+/)
      })

      // Apply exact color to main character zones while preserving detail zones
      allElements.forEach((element, index) => {
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

    }, 100)
  }, [svgContent, selectedCharacterColor, backgroundColor])

  // Apply colors when SVG content changes
  useEffect(() => {
    if (svgContent && svgRef.current) {
      applyDirectColors()
    }
  }, [svgContent, applyDirectColors])

  // Apply colors when character color changes
  useEffect(() => {
    if (svgContent) {
      applyDirectColors()
    }
  }, [selectedCharacterColor, applyDirectColors, svgContent])

  const getCurrentColorDisplay = () => {
    if (selectedCharacterColor === 'original') return '#8B4513'
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
          style={{ backgroundColor: backgroundColor }}
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
             style={{ backgroundColor: preset.color }} 
             onClick={() => handleCharacterColorChange(preset.value)}
             title={preset.name}
           />
         ))}
        </div>
      </div>
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
               backgroundColor: preset.value === 'transparent' ? '#ffffff' : preset.color,
               backgroundImage: preset.value === 'transparent' 
                 ? 'linear-gradient(45deg, #d0d0d0 25%, transparent 25%, transparent 75%, #d0d0d0 75%, #d0d0d0), linear-gradient(45deg, #d0d0d0 25%, transparent 25%, transparent 75%, #d0d0d0 75%, #d0d0d0)'
                 : 'none',
               backgroundSize: preset.value === 'transparent' ? '6px 6px' : 'auto',
               backgroundPosition: preset.value === 'transparent' ? '0 0, 3px 3px' : 'initial'
             }} 
             onClick={() => handleBackgroundColorChange(preset.value)}
             title={preset.name}
           />
         ))}
         </div>
      </div>
    </div>
  )
}

export default AvatarCustomizer