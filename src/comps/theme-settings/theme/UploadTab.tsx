import { useState, useRef } from 'react';
import {
    Text,
    Group,
    Image,
    Stack,
    ActionIcon,
} from '@mantine/core';
import { IconPhoto, IconX } from '@tabler/icons-react';

interface UploadTabProps {
    imageUrl: string;
    onImageChange: (url: string, file?: File) => void;
}

export default function UploadTab({ imageUrl, onImageChange }: UploadTabProps) {
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFile = (file: File) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    onImageChange(e.target.result as string, file);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleRemoveImage = () => {
        onImageChange('', undefined);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Stack gap="md">
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                    border: `2px dashed ${dragActive ? '#228be6' : '#dee2e6'}`,
                    borderRadius: 12,
                    padding: '40px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: dragActive ? '#e7f5ff' : '#f8f9fa',
                    transition: 'all 0.2s ease',
                }}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
                <Stack align="center" gap="xs">
                    <IconPhoto size={48} color="#868e96" />
                    <Text size="sm" c="dimmed">
                        ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
                    </Text>
                    <Text size="xs" c="dimmed">
                        รองรับไฟล์ PNG, JPG, JPEG, GIF
                    </Text>
                </Stack>
            </div>

            {imageUrl && (
                <div style={{ position: 'relative' }}>
                    <Text size="sm" fw={500} mb="xs">รูปที่เลือก:</Text>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <Image
                            src={imageUrl}
                            alt="Uploaded preview"
                            radius="md"
                            h={150}
                            w="auto"
                            fit="contain"
                            fallbackSrc="https://placehold.co/400x200?text=Error+Loading"
                        />
                        <ActionIcon
                            color="red"
                            variant="filled"
                            size="sm"
                            style={{
                                position: 'absolute',
                                top: -8,
                                right: -8,
                            }}
                            onClick={handleRemoveImage}
                        >
                            <IconX size={14} />
                        </ActionIcon>
                    </div>
                </div>
            )}
        </Stack>
    );
}
