import { useState, useRef, useEffect } from 'react';
import {
    Text,
    Stack,
    Slider,
    Group,
    Button,
} from '@mantine/core';
import { IconZoomIn, IconZoomOut, IconRefresh, IconSquareRoundedChevronDown, IconMapPin } from '@tabler/icons-react';

export async function generateCroppedThemeImage(
    sourceImageUrl: string,
    position: { x: number; y: number },
    zoom: number,
    width: number = 360,
    height: number = 180,
): Promise<string> {
    if (!sourceImageUrl) return sourceImageUrl;

    return new Promise((resolve) => {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.src = sourceImageUrl;

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(sourceImageUrl);
                    return;
                }

                const baseScale = Math.max(width / img.width, height / img.height);
                const drawScale = baseScale * zoom;
                const drawWidth = img.width * drawScale;
                const drawHeight = img.height * drawScale;

                const centerX = width / 2;
                const centerY = height / 2;
                const drawX = centerX - drawWidth / 2 + position.x;
                const drawY = centerY - drawHeight / 2 + position.y;

                ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
                resolve(canvas.toDataURL('image/png'));
            } catch (error) {
                console.error('Crop failed, fallback to original image:', error);
                resolve(sourceImageUrl);
            }
        };

        img.onerror = () => resolve(sourceImageUrl);
    });
}

interface PreviewTabProps {
    imageUrl: string;
    position: { x: number; y: number };
    zoom: number;
    onPositionChange: (position: { x: number; y: number }) => void;
    onZoomChange: (zoom: number) => void;
    onCroppedImageChange?: (croppedImageUrl: string) => void;
}

export default function PreviewTab({
    imageUrl,
    position,
    zoom,
    onPositionChange,
    onZoomChange,
    onCroppedImageChange,
}: PreviewTabProps) {
    const PREVIEW_WIDTH = 360;
    const PREVIEW_HEIGHT = 180;
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const initialCropSkipped = useRef(false);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!imageUrl) return;
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        onPositionChange({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (!imageUrl) return;
        const touch = e.touches[0];
        setIsDragging(true);
        setDragStart({
            x: touch.clientX - position.x,
            y: touch.clientY - position.y,
        });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        onPositionChange({
            x: touch.clientX - dragStart.x,
            y: touch.clientY - dragStart.y,
        });
    };

    const handleReset = () => {
        onPositionChange({ x: 0, y: 0 });
        onZoomChange(1);
    };

    useEffect(() => {
        const handleGlobalMouseUp = () => setIsDragging(false);
        window.addEventListener('mouseup', handleGlobalMouseUp);
        window.addEventListener('touchend', handleGlobalMouseUp);
        return () => {
            window.removeEventListener('mouseup', handleGlobalMouseUp);
            window.removeEventListener('touchend', handleGlobalMouseUp);
        };
    }, []);

    useEffect(() => {
        initialCropSkipped.current = false;
    }, [imageUrl]);

    useEffect(() => {
        if (!imageUrl || !onCroppedImageChange) return;

        // Keep original image on first mount; only replace after user adjusts zoom/position.
        if (!initialCropSkipped.current) {
            initialCropSkipped.current = true;
            return;
        }

        const timer = window.setTimeout(() => {
            generateCroppedThemeImage(imageUrl, position, zoom, PREVIEW_WIDTH, PREVIEW_HEIGHT)
                .then((croppedDataUrl) => {
                    onCroppedImageChange(croppedDataUrl);
                });
        }, 120);

        return () => {
            window.clearTimeout(timer);
        };
    }, [imageUrl, position.x, position.y, zoom, onCroppedImageChange]);

    return (
        <Stack gap="md">
            <Text size="sm" fw={500}>ตัวอย่างการแสดงผล:</Text>

            <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
                style={{
                    width: '100%',
                    maxWidth: PREVIEW_WIDTH,
                    height: PREVIEW_HEIGHT,
                    borderRadius: 16,
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: imageUrl ? (isDragging ? 'grabbing' : 'grab') : 'default',
                    backgroundColor: '#fef3e2',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    margin: '0 auto',
                    userSelect: 'none',
                }}
            >
                {imageUrl ? (
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundImage: `url(${imageUrl})`,
                            backgroundSize: `${zoom * 100}%`,
                            backgroundPosition: `calc(50% + ${position.x}px) calc(50% + ${position.y}px)`,
                            backgroundRepeat: 'no-repeat',
                            transition: isDragging ? 'none' : 'background-size 0.2s ease',
                        }}
                    />
                ) : (
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Text c="dimmed" size="sm">กรุณาอัปโหลดรูปภาพ</Text>
                    </div>
                )}

                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                    }}
                >
                    {/* top section */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '16px 16px 8px 16px',
                        }}>
                        <div>
                            <Text
                                fw={700}
                                size="xl"
                                style={{
                                    textShadow: '0 1px 2px rgba(255,255,255,0.8)',
                                }}
                            >
                                ชื่อวิชา
                            </Text>
                            <Text
                                size="sm"
                                style={{
                                    color: 'grey',
                                    textShadow: '0 1px 2px rgba(255,255,255,0.8)',
                                }}
                            >
                                กลุ่มเรียน
                            </Text>
                            <div
                                style={{
                                    display: 'inline-block',
                                    backgroundColor: 'white',
                                    padding: '4px 12px',
                                    borderRadius: 24,
                                    fontSize: 12,
                                    fontWeight: 500,
                                    marginTop: 8,
                                }}
                            >
                                ภาคเรียน
                            </div>
                        </div>
                    </div>

                    {/* bottom section */}
                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: '#FFCF9A',
                            width: '100%',
                            borderRadius: '0 0 16px 16px',
                            padding: '10px 14px',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: 12,
                            }}
                        >
                            <IconSquareRoundedChevronDown size={16} />
                            <span>ตารางเรียน</span>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: 12,
                            }}
                        >
                            <IconMapPin size={16} />
                            <span>ห้องเรียน</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Zoom Controls */}
            {imageUrl && (
                <Stack gap="xs">
                    <Group gap="xs" justify="space-between">
                        <Text size="sm" c="dimmed">ซูม:</Text>
                        <Button
                            variant="subtle"
                            size="xs"
                            leftSection={<IconRefresh size={14} />}
                            onClick={handleReset}
                        >
                            รีเซ็ต
                        </Button>
                    </Group>
                    <Group gap="sm" align="center">
                        <IconZoomOut size={16} color="#868e96" />
                        <Slider
                            value={zoom}
                            onChange={onZoomChange}
                            min={0.5}
                            max={3}
                            step={0.1}
                            style={{ flex: 1 }}
                            label={(value) => `${Math.round(value * 100)}%`}
                        />
                        <IconZoomIn size={16} color="#868e96" />
                    </Group>
                    <Text size="xs" c="dimmed" ta="center">
                        ลากรูปเพื่อปรับตำแหน่ง
                    </Text>
                </Stack>
            )}
        </Stack>
    );
}
