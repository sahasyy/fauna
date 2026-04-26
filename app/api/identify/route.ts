import { NextResponse } from "next/server";
import { identifyImage } from "@/lib/identification";
import {
  createIdentificationError,
  type CaptureSource,
  type IdentificationLocation,
} from "@/lib/identification/types";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const SUPPORTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const capturedAt = new Date().toISOString();

  try {
    const contentType = request.headers.get("content-type") || "";
    if (
      !contentType.includes("multipart/form-data") &&
      !contentType.includes("application/x-www-form-urlencoded")
    ) {
      return NextResponse.json(
        createIdentificationError(
          "No image was sent.",
          "Capture a frame or upload a photo before identifying.",
          capturedAt,
        ),
        { status: 400 },
      );
    }

    const formData = await request.formData();
    const image = formData.get("image");
    const submittedAt = readString(formData.get("capturedAt")) || capturedAt;
    const source = readSource(formData.get("source"));

    if (!(image instanceof File)) {
      return NextResponse.json(
        createIdentificationError(
          "No image was sent.",
          "Capture a frame or upload a photo before identifying.",
          submittedAt,
        ),
        { status: 400 },
      );
    }

    if (!SUPPORTED_TYPES.has(image.type)) {
      return NextResponse.json(
        createIdentificationError(
          "Unsupported image type.",
          "Use a JPEG, PNG, or WebP image.",
          submittedAt,
        ),
        { status: 415 },
      );
    }

    if (image.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        createIdentificationError(
          "That image is too large to identify.",
          "Try again with a smaller or less detailed frame.",
          submittedAt,
        ),
        { status: 413 },
      );
    }

    const arrayBuffer = await image.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const location = readLocation(formData);

    const result = await identifyImage({
      imageDataUrl: `data:${image.type};base64,${base64}`,
      mimeType: image.type,
      sizeBytes: image.size,
      capturedAt: submittedAt,
      source,
      location,
    });

    return NextResponse.json(result, {
      status: result.status === "error" ? 503 : 200,
    });
  } catch (error) {
    return NextResponse.json(
      createIdentificationError(
        "Identification failed before the model could run.",
        error instanceof Error ? error.message : "Unknown server error.",
        capturedAt,
      ),
      { status: 500 },
    );
  }
}

function readLocation(formData: FormData): IdentificationLocation | undefined {
  const latitude = readNumber(formData.get("latitude"));
  const longitude = readNumber(formData.get("longitude"));
  const accuracy = readNumber(formData.get("accuracy"));

  if (latitude === undefined || longitude === undefined) return undefined;
  if (latitude < -90 || latitude > 90) return undefined;
  if (longitude < -180 || longitude > 180) return undefined;

  return {
    latitude,
    longitude,
    accuracy,
  };
}

function readString(value: FormDataEntryValue | null): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function readSource(value: FormDataEntryValue | null): CaptureSource {
  if (value === "live_camera" || value === "upload") return value;
  return "unknown";
}

function readNumber(value: FormDataEntryValue | null): number | undefined {
  if (typeof value !== "string" || value.trim() === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}
