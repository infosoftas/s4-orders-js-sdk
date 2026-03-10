function useQueryParams(): URLSearchParams {
    return new URLSearchParams(location.search);
}

export default useQueryParams;
