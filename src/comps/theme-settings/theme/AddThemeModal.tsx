import {
    Modal,
    Button,
    Group,
    TextInput,
    Tabs,
    Switch, 
} from "@mantine/core";
import { IconUpload, IconEye } from '@tabler/icons-react';
import { useForm } from "@mantine/form";
import { themeSettingsFields } from "@/utils/interface/themeSettings.types";
import { useState } from "react";
import UploadTab from "./UploadTab";
import PreviewTab, { generateCroppedThemeImage } from "./PreviewTab";
import { DateInput } from "@mantine/dates";

interface AddThemeModalProps {
    opened: boolean;
    close: () => void;
    onSubmit?: (values: themeSettingsFields) => void;
    token?: any;
}

export default function AddThemeModal({
    opened,
    close,
    onSubmit,
    token
}: AddThemeModalProps) {
    const [activeTab, setActiveTab] = useState<string | null>('upload');
    const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
    const [imageZoom, setImageZoom] = useState(1);
    const [originalImageUrl, setOriginalImageUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm({
        initialValues: {
            theme_name: "",
            theme_url: "",
            start_date: null as Date | null,
            end_date: null as Date | null,
            is_default: false,
        },
    });

    const dataUrlToFile = (dataUrl: string, fileName: string) => {
        const [meta, base64Data] = dataUrl.split(',');
        const mimeMatch = meta.match(/data:(.*?);base64/);
        const mime = mimeMatch?.[1] || 'image/png';
        const byteChars = atob(base64Data || '');
        const byteNumbers = new Array(byteChars.length);

        for (let i = 0; i < byteChars.length; i += 1) {
            byteNumbers[i] = byteChars.charCodeAt(i);
        }

        return new File([new Uint8Array(byteNumbers)], fileName, { type: mime });
    };

    const handleImageChange = (url: string, file?: File) => {
        setOriginalImageUrl(url);
        setSelectedFile(file || null);
        form.setFieldValue('theme_url', url);
        if (url) {
            setImagePosition({ x: 0, y: 0 });
            setImageZoom(1);
        }
    };

    const handleCroppedImageChange = (croppedUrl: string) => {
        form.setFieldValue('theme_url', croppedUrl);
    };

    const handleDefaultChange = (checked: boolean) => {
        form.setFieldValue('is_default', checked);
        if (checked) {
            form.setFieldValue('start_date', null);
            form.setFieldValue('end_date', null);
            form.clearFieldError('start_date');
            form.clearFieldError('end_date');
        }
    };

    const handleSubmit = async (values: themeSettingsFields) => {
        if (isSubmitting) return;

        if (!selectedFile) {
            form.setFieldError('theme_url', 'กรุณาอัปโหลดไฟล์รูปภาพ');
            return;
        }

        setIsSubmitting(true);
        try {
            const hasAdjustedImage = imageZoom !== 1 || imagePosition.x !== 0 || imagePosition.y !== 0;
            const croppedThemeUrl = hasAdjustedImage && originalImageUrl
                ? await generateCroppedThemeImage(originalImageUrl, imagePosition, imageZoom)
                : values.theme_url;

            const fileForSubmit = hasAdjustedImage && croppedThemeUrl
                ? dataUrlToFile(croppedThemeUrl, selectedFile.name || 'theme.png')
                : selectedFile;

            console.log("submit values:", values);
            await onSubmit?.({
                ...values,
                theme_url: croppedThemeUrl,
                file: fileForSubmit,
            });
            handleClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        form.reset();
        setOriginalImageUrl('');
        setSelectedFile(null);
        setImagePosition({ x: 0, y: 0 });
        setImageZoom(1);
        setActiveTab('upload');
        close();
    };

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            centered
            size="lg"
            radius={16}
        >
            <h1 className="color-black font-bold text-2xl mb-4 text-center">เพิ่มธีม</h1>
            <form onSubmit={form.onSubmit(handleSubmit)} className="gap-4 flex flex-col">
                <TextInput
                    label="ชื่อธีม"
                    placeholder="กรอกชื่อธีม"
                    {...form.getInputProps("theme_name")}
                    radius={8}
                    required
                />

                <Switch
                    label="ตั้งค่าเป็นธีมเริ่มต้น"
                    description="ธีมนี้จะถูกตั้งเป็นธีมเริ่มต้นใหม่แทนธีมเริ่มต้นเดิม และจะไม่ต้องระบุช่วงวันที่"
                    checked={form.values.is_default}
                    onChange={(e) => handleDefaultChange(e.currentTarget.checked)}
                    radius="md"
                    size="sm"
                    color="blue"
                />

                <Group grow>
                    <DateInput
                        id="input-start-date"
                        label="วันที่เริ่มต้น"
                        valueFormat="DD/MM/YYYY"
                        placeholder="เช่น 01/01/2567"
                        {...form.getInputProps("start_date")}
                        required={!form.values.is_default} 
                        disabled={form.values.is_default}  
                        radius={8}
                    />

                    <DateInput
                        id="input-end-date"
                        label="วันที่สิ้นสุด"
                        valueFormat="DD/MM/YYYY"
                        placeholder="เช่น 30/04/2567"
                        {...form.getInputProps("end_date")}
                        required={!form.values.is_default}
                        disabled={form.values.is_default}
                        radius={8}
                    />
                </Group>

                <Tabs value={activeTab} onChange={setActiveTab} mt="sm">
                    <Tabs.List grow>
                        <Tabs.Tab value="upload" leftSection={<IconUpload size={16} />}>
                            อัปโหลดรูป
                        </Tabs.Tab>
                        <Tabs.Tab value="preview" leftSection={<IconEye size={16} />}>
                            ตัวอย่าง
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="upload" pt="md">
                        <UploadTab
                            imageUrl={originalImageUrl}
                            onImageChange={handleImageChange}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel value="preview" pt="md">
                        <PreviewTab
                            imageUrl={originalImageUrl}
                            position={imagePosition}
                            zoom={imageZoom}
                            onPositionChange={setImagePosition}
                            onZoomChange={setImageZoom}
                            onCroppedImageChange={handleCroppedImageChange}
                        />
                    </Tabs.Panel>
                </Tabs>

                <Group justify="flex-end" className="mt-8">
                    <Button color="blue" variant="outline" onClick={handleClose} radius={8}>
                        ยกเลิก
                    </Button>

                    <Button type="submit" radius={8} disabled={isSubmitting} loading={isSubmitting}>
                        บันทึก
                    </Button>
                </Group>
            </form>
        </Modal>
    );
}