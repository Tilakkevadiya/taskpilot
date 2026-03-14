package com.taskpilot.backend.util;

import jakarta.activation.DataSource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

public class MultipartFileDataSource implements DataSource {
    private final MultipartFile multipartFile;

    public MultipartFileDataSource(MultipartFile multipartFile) {
        this.multipartFile = multipartFile;
    }

    @Override
    public InputStream getInputStream() throws IOException {
        return multipartFile.getInputStream();
    }

    @Override
    public OutputStream getOutputStream() throws IOException {
        throw new UnsupportedOperationException("Output stream not supported");
    }

    @Override
    public String getContentType() {
        return multipartFile.getContentType();
    }

    @Override
    public String getName() {
        return multipartFile.getOriginalFilename();
    }
}
