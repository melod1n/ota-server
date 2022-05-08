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
    enabled: number;
    fileName?: string;
    date: number;
}

export {
    Product, Branch, Release
};