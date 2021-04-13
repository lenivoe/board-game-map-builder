import React, { ReactNode, useCallback } from 'react';
import { FileDrop } from 'react-file-drop';
import FileReaderAsync from '../../common/FileReaderAsync';

interface ImageBasketProps {
    onFileLoadComplete: (name: string, url: string) => void;
    children?: ReactNode;
}

export default function ImageBasket({ onFileLoadComplete, children }: ImageBasketProps) {
    const onFileDrop = useCallback(
        (files: FileList | null) =>
            Array.from(files ?? ([] as File[]))
                .filter((file) => file.type.startsWith('image/'))
                .forEach((file) => {
                    const maxSizeMb = 20;
                    if (file.size > maxSizeMb * 1024 * 1024) {
                        alert(`image size > ${maxSizeMb} mb: "${file.name}"`);
                        return;
                    }
                    FileReaderAsync.readFromBlob(file).then((url) =>
                        onFileLoadComplete(file.name, url)
                    );
                }),
        [onFileLoadComplete]
    );

    return <FileDrop onDrop={onFileDrop}>{children}</FileDrop>;
}
