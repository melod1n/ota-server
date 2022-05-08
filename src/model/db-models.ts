class Product {
    id: number;
    name: string;
}

class Branch {
    id: number;
    productId: number;
    name: string;
}

class Release {
    id: number;
    versionName: string;
    versionCode: number;
    productId: number;
    branchId: number;
    mandatory: number;
    changelog?: string;
    downloadLink: string;
}

export {
    Product, Branch, Release
};