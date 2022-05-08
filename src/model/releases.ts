export class Release {
    id: number;
    versionName: string;
    versionCode: number;
    productId: number;
    branchId: number;
    mandatory: number;
    changelog?: string;
    enabled: number;
    fileName?: string;
    date: number;
    extension?: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    encoding: string;
}

export class ReleaseEdit {
    versionName: string;
    versionCode: number;
    mandatory: number;
    changelog?: string;
    enabled: number;

    applyToRelease(release: Release) {
        release.versionName = this.versionName;
        release.versionCode = this.versionCode;
        release.mandatory = this.mandatory;
        release.changelog = this.changelog;
        release.enabled = this.enabled;
    }
}

export class ReleaseAdd {
    versionName: string;
    versionCode: number;
    productId: number;
    branchId: number;
    mandatory: number;
    changelog?: string;

    mapToRelease(): Release {
        const release = new Release();
        release.versionName = this.versionName;
        release.versionCode = this.versionCode;
        release.productId = this.productId;
        release.branchId = this.branchId;
        release.mandatory = this.mandatory;
        release.changelog = this.changelog;

        return release;
    }
}