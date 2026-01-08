"use client"

/**
 * FileImportDropzone Component
 *
 * Drag and drop zone for .fit/.gpx/.tcx activity file uploads.
 */

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { cn } from "@/lib/utils"
import { Upload, FileCheck, Loader2, AlertCircle, X } from "lucide-react"
import { importActivityFile } from "@/app/actions/importActivityFile"
import { formatDistance, formatDuration } from "@/lib/import"
import { toast } from "sonner"

interface FileImportDropzoneProps {
  sportId?: string
  onSuccess?: (activityId: string) => void
  onError?: (error: string) => void
  className?: string
}

type ImportState = "idle" | "uploading" | "success" | "error"

interface ImportedActivity {
  id: string
  title: string
  sport: string
  distance: number
  duration: number
}

const ACCEPTED_EXTENSIONS = {
  "application/octet-stream": [".fit"],
  "application/gpx+xml": [".gpx"],
  "application/xml": [".gpx", ".tcx"],
  "text/xml": [".gpx", ".tcx"],
}

export function FileImportDropzone({
  sportId,
  onSuccess,
  onError,
  className,
}: FileImportDropzoneProps) {
  const [state, setState] = useState<ImportState>("idle")
  const [error, setError] = useState<string | null>(null)
  const [importedActivity, setImportedActivity] = useState<ImportedActivity | null>(
    null
  )

  const handleFile = useCallback(
    async (file: File) => {
      setState("uploading")
      setError(null)

      try {
        // Read file as base64
        const content = await readFileAsBase64(file)

        // Call server action
        const result = await importActivityFile({
          filename: file.name,
          content,
          sportId,
        })

        if (result.success && result.activityId) {
          setState("success")
          setImportedActivity({
            id: result.activityId,
            title: result.normalized?.title || "Imported Activity",
            sport: result.normalized?.sportSlugGuess || "activity",
            distance: result.normalized?.distanceM || 0,
            duration: result.normalized?.durationSec || 0,
          })
          toast.success("Activity imported successfully!")
          onSuccess?.(result.activityId)
        } else {
          setState("error")
          const errorMsg = result.error || "Import failed"
          setError(errorMsg)
          onError?.(errorMsg)
          toast.error(errorMsg)
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Import failed"
        setState("error")
        setError(errorMsg)
        onError?.(errorMsg)
        toast.error(errorMsg)
      }
    },
    [sportId, onSuccess, onError]
  )

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_EXTENSIONS,
    multiple: false,
    disabled: state === "uploading",
  })

  const reset = () => {
    setState("idle")
    setError(null)
    setImportedActivity(null)
  }

  if (state === "success" && importedActivity) {
    return (
      <div
        className={cn(
          "border-2 border-green-200 dark:border-green-800 rounded-lg p-6 bg-green-50 dark:bg-green-900/20",
          className
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
              <FileCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-200">
                Activity Imported
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400">
                {importedActivity.title}
              </p>
              <p className="text-xs text-green-500 dark:text-green-500 mt-1">
                {formatDistance(importedActivity.distance)} •{" "}
                {formatDuration(importedActivity.duration)}
              </p>
            </div>
          </div>
          <button
            onClick={reset}
            className="p-1 hover:bg-green-100 dark:hover:bg-green-800 rounded"
          >
            <X className="h-4 w-4 text-green-600 dark:text-green-400" />
          </button>
        </div>
      </div>
    )
  }

  if (state === "error" && error) {
    return (
      <div
        className={cn(
          "border-2 border-red-200 dark:border-red-800 rounded-lg p-6 bg-red-50 dark:bg-red-900/20",
          className
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-800 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-200">
                Import Failed
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
          <button
            onClick={reset}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded"
          >
            <X className="h-4 w-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
        <button
          onClick={reset}
          className="mt-4 px-4 py-2 text-sm font-medium bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
        state === "uploading" && "pointer-events-none opacity-70",
        className
      )}
      data-testid="file-import-dropzone"
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center gap-3">
        {state === "uploading" ? (
          <>
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-lg font-medium">Processing file...</p>
            <p className="text-sm text-muted-foreground">
              Parsing and importing activity data
            </p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-lg font-medium">
                {isDragActive
                  ? "Drop your activity file here"
                  : "Drag & drop an activity file"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to select a file
              </p>
            </div>
            <div className="flex gap-2 mt-2">
              <span className="px-2 py-1 text-xs font-medium bg-muted rounded">
                .FIT
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-muted rounded">
                .GPX
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-muted rounded">
                .TCX
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/**
 * Read file as base64
 */
function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove data URL prefix
      const base64 = result.split(",")[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
