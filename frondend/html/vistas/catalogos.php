<div class="container-fluid px-4 py-3">
    <div class="alert alert-info d-flex align-items-center mb-4 border-0 shadow-sm">
        <i class="bi bi-info-circle-fill me-2 fs-5"></i>
        <div>Selecciona un catálogo para gestionar su información en la base de datos.</div>
    </div>

    <div class="row g-4 mb-4">
        <div class="col-md-4">
            <div class="card h-100 text-center py-4 shadow-sm border-0 rounded-4">
                <i class="bi bi-journal-bookmark-fill text-primary mb-3" style="font-size: 3rem;"></i>
                <h5 class="fw-bold">Materias</h5>
                <button class="btn btn-outline-primary btn-sm mx-auto mt-2 px-4 rounded-pill" id="btn-cat-materias">Gestionar Materias</button>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card h-100 text-center py-4 shadow-sm border-0 rounded-4">
                <i class="bi bi-door-open-fill text-success mb-3" style="font-size: 3rem;"></i>
                <h5 class="fw-bold">Salones y Edificios</h5>
                <button class="btn btn-outline-success btn-sm mx-auto mt-2 px-4 rounded-pill" id="btn-cat-salones">Gestionar Salones</button>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card h-100 text-center py-4 shadow-sm border-0 rounded-4">
                <i class="bi bi-mortarboard-fill text-warning mb-3" style="font-size: 3rem;"></i>
                <h5 class="fw-bold">Carreras</h5>
                <button class="btn btn-outline-warning btn-sm mx-auto mt-2 px-4 rounded-pill" id="btn-cat-carreras">Gestionar Carreras</button>
            </div>
        </div>
    </div>

    <div id="contenedor-catalogos" class="card shadow-sm border-0 rounded-4" style="display: none;">
        <div class="card-header bg-white border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center">
            <h5 class="fw-bold mb-0 text-secondary" id="titulo-tabla-catalogo">Título Dinámico</h5>
            <button class="btn btn-primary btn-sm shadow-sm" id="btn-nuevo-registro">
                <i class="bi bi-plus-lg"></i> Nuevo Registro
            </button>
        </div>
        <div class="card-body mt-2">
            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <thead class="table-light" id="thead-catalogo">
                        </thead>
                    <tbody id="tbody-catalogo">
                        </tbody>
                </table>
            </div>
        </div>
    </div>
</div>