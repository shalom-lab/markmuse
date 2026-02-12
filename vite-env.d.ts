// 针对 ?raw 后缀的声明
declare module '*?raw' {
    const content: string;
    export default content;
}

// 针对 ?inline 后缀的声明（如果你用的是 inline）
declare module '*?inline' {
    const content: string;
    export default content;
}